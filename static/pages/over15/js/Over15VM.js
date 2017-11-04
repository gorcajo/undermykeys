/* exported Over15VM */
"use strict";

class Over15VM {
    constructor() {
        // General properties:
        this.name = "Over7i VM";
        this.memorySize = 65536; // 64 KiB of memory (16-bit addresses)
        this.stackSize = 16;     // 16 nesting levels (4-bit SP)
        this.registers = 16;     // 16 registers (16-bit width)

        // Over7i memory:
        this.memory = new Uint8Array(this.memorySize);
        this.pc = 0x0000; // Program Counter

        // Over7i registers:
        this.r = new Uint16Array(this.registers);

        // Over7i stack:
        this.stack = new Uint16Array(this.stackSize); 
        this.spRegister = 0xe; // Stack Pointer location into the registers

        // Over7i ports:
        this.portCregister = 0xc; // Port C location into the registers
        this.portDregister = 0xd; // Port D location into the registers

        // Over7i flags:
        this.flagsRegister = 0xf; // Flags location into the registers

        // Performs the VM hard-reset at start:
        this.hardReset();
    }

    getName() {
        return this.name;
    }

    getMemorySize() {
        return this.memorySize;
    }

    getStackSize() {
        return this.stackSize;
    }

    getRegisters() {
        return this.registers;
    }

    hardReset() {
        for (let i = 0; i < this.memorySize; i++)
            this.memory[i] = 0xff;

        this.softReset();
    }

    softReset() {
        this.pc = 0x0000;

        for (let i = 0; i < this.stackSize; i++)
            this.stack[i] = 0x0000;

        this.r[this.spRegister] = 0x00;

        for (let i = 0; i < this.registers; i++)
            this.r[i] = 0x0000;
    }

    step() {
        // Temporary variables:
        let nibble = 0x0;
        let Rx = 0x0;
        let Ry = 0x0;
        let Rz = 0x0;
        let literal = 0x0000;
        let pointer = 0x0000;
        let result = 0;

        // This huge switch is the Virtual Machine's heart:

        switch (this.memory[this.pc]) {

            // Assign operations //////////////////////////////////////////////////////////////////////////////////////

            case 0x01:                                                                                    // COPY Rx Ry
                Rx = (this.memory[this.pc + 1] & 0xF0) >> 4;
                Ry = this.memory[this.pc + 1] & 0x0F;
                this.r[Rx] = this.r[Ry];
                this.pc += 2;
            break;

            case 0x02:
                nibble = (this.memory[this.pc + 1] & 0xF0) >> 4;

                switch (nibble) {
                    case 0x0:                                                                           // COPY Rx nnnn
                        Rx = this.memory[this.pc + 1] & 0x0F;
                        pointer = (this.memory[this.pc + 2] << 8) + this.memory[this.pc + 3];
                        this.r[Rx] = this.memory[pointer];
                    break;

                    case 0x1:                                                                           // COPY nnnn Rx
                        Rx = this.memory[this.pc + 1] & 0x0F;
                        pointer = (this.memory[this.pc + 2] << 8) + this.memory[this.pc + 3];
                        this.memory[pointer] = this.r[Rx] & 0x00FF;
                    break;

                    case 0x2:                                                                          // COPY Rx #nnnn
                        Rx = this.memory[this.pc + 1] & 0x0F;
                        literal = (this.memory[this.pc + 2] << 8) + this.memory[this.pc + 3];
                        this.r[Rx] = literal;
                    break;

                    default:
                        this.resetAndSetErrorFlag();
                }

                this.pc += 4;
            break;
            
            case 0x03:                                                                                   // COPY Rx *Ry
                Rx = (this.memory[this.pc + 1] & 0xF0) >> 4;
                Ry = this.memory[this.pc + 1] & 0x0F;
                this.r[Rx] = this.memory[this.r[Ry]];
                this.pc += 2;
            break;
            
            case 0x04:                                                                                   // COPY *Rx Ry
                Rx = (this.memory[this.pc + 1] & 0xF0) >> 4;
                Ry = this.memory[this.pc + 1] & 0x0F;
                this.memory[this.r[Rx]] = this.r[Ry];
                this.pc += 2;
            break;

            // Math operations ////////////////////////////////////////////////////////////////////////////////////////

            case 0x10:                                                                                     // ADD Rx Ry
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                Ry = this.memory[this.pc + 1] & 0x0f;
                
                result = this.r[Rx] + this.r[Ry];

                if (result < 65536) {
                    this.r[0xa] = result;
                    this.lowerCflag();
                }
                else {
                    this.r[0xa] = result & 0xffff;
                    this.raiseCflag();
                }

                this.pc += 2;
            break;

            case 0x11:                                                                                     // SUB Rx Ry
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                Ry = this.memory[this.pc + 1] & 0x0f;
                
                result = this.r[Rx] - this.r[Ry];

                if (result >= 0) {
                    this.r[0xa] = result;
                    this.lowerBflag();
                }
                else {
                    this.r[0xa] = result & 0xffff;
                    this.raiseBflag();
                }

                this.pc += 2;
            break;

            case 0x12:                                                                                    // MULT Rx Ry
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                Ry = this.memory[this.pc + 1] & 0x0f;
                
                result = this.r[Rx] * this.r[Ry];

                this.r[0xa] = result & 0x0000ffff;
                this.r[0xb] = (result & 0xffff0000) >> 16;

                this.pc += 2;
            break;

            case 0x13:                                                                                     // DIV Rx Ry
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                Ry = this.memory[this.pc + 1] & 0x0f;

                this.r[0xa] = this.r[Rx] / this.r[Ry];
                this.r[0xb] = this.r[Rx] % this.r[Ry];

                this.pc += 2;
            break;

            case 0x14:                                                                                     // INC Rx #i
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                literal = this.memory[this.pc + 1] & 0x0f;

                result = this.r[Rx] + literal;

                if (result < 65536) {
                    this.r[Rx] = result;
                    this.lowerCflag();
                }
                else {
                    this.r[Rx] = result & 0xffff;
                    this.raiseCflag();
                }

                this.pc += 2;
            break;

            case 0x15:                                                                                     // DEC Rx #i
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                literal = this.memory[this.pc + 1] & 0x0f;

                result = this.r[Rx] - literal;

                if (result >= 0) {
                    this.r[Rx] = result;
                    this.lowerBflag();
                }
                else {
                    this.r[Rx] = result & 0xffff;
                    this.raiseBflag();
                }

                this.pc += 2;
            break;

            // Bitwise operations /////////////////////////////////////////////////////////////////////////////////////

            case 0x20:                                                                                        // NOT Rx
                Rx = this.memory[this.pc + 1] & 0x0f;
                this.r[0xa] = ~this.r[Rx];
                this.pc += 2;
            break;

            case 0x21:                                                                                        // INV Rx
                Rx = this.memory[this.pc + 1] & 0x0f;
                this.r[Rx] = ~this.r[Rx];
                this.pc += 2;
            break;

            case 0x22:                                                                                        // LSH Rx
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                literal = this.memory[this.pc + 1] & 0x0f;
                this.r[Rx] = this.r[Rx] << literal;
                this.pc += 2;
            break;

            case 0x23:                                                                                        // RSH Rx
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                literal = this.memory[this.pc + 1] & 0x0f;
                this.r[Rx] = (this.r[Rx] >> literal);
                this.pc += 2;
            break;

            case 0x24:                                                                                     // OR Rx Ry
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                Ry = this.memory[this.pc + 1] & 0x0f;
                this.r[0xa] = this.r[Rx] | this.r[Ry];
                this.pc += 2;
            break;

            case 0x25:                                                                                     // AND Rx Ry
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                Ry = this.memory[this.pc + 1] & 0x0f;
                this.r[0xa] = this.r[Rx] & this.r[Ry];
                this.pc += 2;
            break;

            case 0x26:                                                                                     // XOR Rx Ry
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                Ry = this.memory[this.pc + 1] & 0x0f;
                this.r[0xa] = this.r[Rx] ^ this.r[Ry];
                this.pc += 2;
            break;

            // Compare operations /////////////////////////////////////////////////////////////////////////////////////

            case 0x30:                                                                                     // CMP Rx Ry
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                Ry = this.memory[this.pc + 1] & 0x0f;

                if (this.r[Rx] < this.r[Ry]) {
                    this.raiseLflag();
                    this.lowerEflag();
                    this.lowerGflag();
                }
                else if (this.r[Rx] > this.r[Ry]) {
                    this.lowerLflag();
                    this.lowerEflag();
                    this.raiseGflag();
                }
                else {
                    this.lowerLflag();
                    this.raiseEflag();
                    this.lowerGflag();
                }

                this.pc += 2;
            break;

            // Conditional jump operations ////////////////////////////////////////////////////////////////////////////

            case 0x40:
                nibble = (this.memory[this.pc + 1] & 0xf0) >> 4;
                Rz = this.memory[this.pc + 1] & 0x0f;

                switch (nibble) {
                    case 0x0:                                                                                  // JE Rz
                        if (this.getEflag() === true)
                            this.pc = this.r[Rz];
                        else
                            this.pc += 2;
                    break;
                    
                    case 0x1:                                                                                 // JNE Rz
                        if (this.getEflag() !== true)
                            this.pc = this.r[Rz];
                        else
                            this.pc += 2;
                    break;
                    
                    case 0x2:                                                                                  // JG Rz
                        if (this.getGflag() === true)
                            this.pc = this.r[Rz];
                        else
                            this.pc += 2;
                    break;
                    
                    case 0x3:                                                                                 // JGE Rz
                        if ((this.getGflag() === true) || (this.getEflag() === true))
                            this.pc = this.r[Rz];
                        else
                            this.pc += 2;
                    break;
                    
                    case 0x4:                                                                                  // JL Rz
                        if (this.getLflag() === true)
                            this.pc = this.r[Rz];
                        else
                            this.pc += 2;
                    break;
                    
                    case 0x5:                                                                                 // JLE Rz
                        if ((this.getLflag() === true) || (this.getEflag() === true))
                            this.pc = this.r[Rz];
                        else
                            this.pc += 2;
                    break;
                    
                    case 0x6:                                                                                  // JC Rz
                        if (this.getCflag() === true)
                            this.pc = this.r[Rz];
                        else
                            this.pc += 2;
                    break;
                    
                    case 0x7:                                                                                 // JNC Rz
                        if (this.getCflag() !== true)
                            this.pc = this.r[Rz];
                        else
                            this.pc += 2;
                    break;
                    
                    case 0x8:                                                                                  // JB Rz
                        if (this.getBflag() === true)
                            this.pc = this.r[Rz];
                        else
                            this.pc += 2;
                    break;
                    
                    case 0x9:                                                                                 // JNB Rz
                        if (this.getBflag() !== true)
                            this.pc = this.r[Rz];
                        else
                            this.pc += 2;
                    break;

                    default:
                        this.resetAndSetErrorFlag();
                }
            break;

            case 0x41:                                                                                      // JZ Rx Rz
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                Rz = this.memory[this.pc + 1] & 0x0f;

                if (this.r[Rx] === 0)
                    this.pc = this.r[Rz];
                else
                    this.pc += 2;
            break;

            case 0x42:                                                                                     // JNZ Rx Rz
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                Rz = this.memory[this.pc + 1] & 0x0f;

                if (this.r[Rx] !== 0)
                    this.pc = this.r[Rz];
                else
                    this.pc += 2;
            break;

            case 0x43:                                                                                     // JGZ Rx Rz
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                Rz = this.memory[this.pc + 1] & 0x0f;

                if (this.r[Rx] > 0)
                    this.pc = this.r[Rz];
                else
                    this.pc += 2;
            break;

            case 0x44:                                                                                     // JLZ Rx Rz
                Rx = (this.memory[this.pc + 1] & 0xf0) >> 4;
                Rz = this.memory[this.pc + 1] & 0x0f;

                if ((this.r[Rx] & 0x8000) !== 0)
                    this.pc = this.r[Rz];
                else
                    this.pc += 2;
            break;

            // Unconditional jump operations //////////////////////////////////////////////////////////////////////////

            case 0x50:                                                                                    // JUMP #nnnn
                this.pc = (this.memory[this.pc + 1] << 8) + this.memory[this.pc + 2];
            break;

            case 0x51:                                                                                     // JUMP nnnn
                pointer = (this.memory[this.pc + 1] << 8) + this.memory[this.pc + 2];
                this.pc = (this.memory[pointer] << 8) + this.memory[pointer + 1];
            break;

            case 0x52:                                                                                       // JUMP Rx
                pointer = (this.memory[this.pc + 1] << 8) + this.memory[this.pc + 2];
                Rx = this.memory[this.pc + 1] & 0x0f;
                this.pc = this.r[Rx];
            break;

            // Call operations ////////////////////////////////////////////////////////////////////////////////////////

            case 0x60:                                                                                    // CALL #nnnn
                if (this.getStackPointer() < (this.stackSize -1)) {
                    this.r[this.spRegister]++;
                    this.setCurrentStackElement(this.pc + 3);
                    this.pc = (this.memory[this.pc + 1] << 8) | this.memory[this.pc + 2];
                }
                else {
                    this.raiseOflag();
                    this.pc += 3;
                }
            break;
            
            case 0x61:                                                                                     // CALL nnnn
                if (this.getStackPointer() < (this.stackSize -1)) {
                    this.r[this.spRegister]++;
                    this.setCurrentStackElement(this.pc + 3);
                    pointer = (this.memory[this.pc + 1] << 8) | this.memory[this.pc + 2];
                    this.pc = (this.memory[pointer] << 8) | this.memory[pointer + 1];
                }
                else {
                    this.raiseOflag();
                    this.pc += 3;
                }
            break;
            
            case 0x62:                                                                                       // CALL Rx
                if (this.getStackPointer() < (this.stackSize -1)) {
                    this.r[this.spRegister]++;
                    this.setCurrentStackElement(this.pc + 2);
                    Rx = this.memory[this.pc + 1] & 0x0f;
                    this.pc = this.r[Rx];
                }
                else {
                    this.raiseOflag();
                    this.pc += 2;
                }
            break;
            
            case 0x63:                                                                                           // RET
                if (this.getStackPointer() !== 0x0) {
                    this.pc = this.getCurrentStackElement();
                    this.setCurrentStackElement(0x0000);
                    this.r[this.spRegister]--;
                }
                else {
                    this.raiseRflag();
                    this.pc += 1;
                }
            break;

            // Stack operations ///////////////////////////////////////////////////////////////////////////////////////

            case 0x70:                                                                                       // PUSH Rx
                Rx = this.memory[this.pc + 1] & 0x0F;

                if (this.getStackPointer() < (this.stackSize -1)) {
                    this.r[this.spRegister]++;
                    this.setCurrentStackElement(this.r[Rx]);
                }
                else {
                    this.raiseOflag();
                }

                this.pc += 2;
            break;

            case 0x71:                                                                                        // POP Rx
                Rx = this.memory[this.pc + 1] & 0x0F;

                this.r[Rx] = this.getCurrentStackElement();

                if (this.getStackPointer() > 0) {
                    this.setCurrentStackElement(0x0000);
                    this.r[this.spRegister]--;
                }

                this.pc += 2;
            break;

            // Other operations ///////////////////////////////////////////////////////////////////////////////////////

            case 0xff:                                                                                           // NOP
                this.pc += 1;
            break;

            case 0x00:                                                                                           // END
                this.pc = 0x0000;
            break;

            // Unknown OpCode /////////////////////////////////////////////////////////////////////////////////////////

            default:
                this.resetAndSetErrorFlag();
        }

        // If we reach the memory very end, we perform a soft reset and then we raise the error flag:

        if (this.pc > 0xFFFF) {
            this.softReset();
            this.raiseRflag();
        }
    }

    resetAndSetErrorFlag() {
        this.softReset();  // Performs a soft-reset (everithing is set to 0 except the memory)
        this.raiseRflag(); // Sets the error flag to 1
    }

    loadBinaries(binaries) {
        this.memory = binaries;
    }

    /**
     * Registers getters & setters
     */

    getRegister(register) {
        if (register < this.registers)
            return this.r[register];
        else
            return null;
    }

    /**
     * Memory getters & setters
     */

    getMemoryAt(address) {
        if (address < this.memorySize)
            return this.memory[address];
        else
            return null;
    }

    getWholeMemory() {
        return this.memory;
    }

    getProgramCounter() {
        return this.pc;
    }

    setProgramCounter(newPc) {
        this.pc = newPc;
    }

    /**
     * Stack getters & setters
     */

    getStackPointer() {
        return (this.r[this.spRegister] & 0x000f);
    }

    setStackPointer(element) {
        if (element < this.stackSize) {
            let otherBits = this.r[this.spRegister] & 0xfff0;
            this.r[this.spRegister] = otherBits + element;
        }
    }

    getCurrentStackElement() {
        return this.stack[this.getStackPointer()];
    }

    setCurrentStackElement(data) {
        this.stack[this.getStackPointer()] = data;
    }

    getStackElement(element) {
        if (element < this.stackSize)
            return this.stack[element];
        else
            return null;
    }

    setStackElement(element, data) {
        if (element < this.stackSize)
            this.stack[element] = data;
        else
            return null;
    }

    /**
     * Ports getters & setters
     */

    getPortC() {
        return (this.r[this.portCregister] & 0x00FF);
    }

    getPortD() {
        return (this.r[this.portDregister] & 0x00FF);
    }

    /**
     * Flags getters
     */

    getCflag() {
        return ((this.r[this.flagsRegister] & 0x01) !== 0);
    }

    getBflag() {
        return ((this.r[this.flagsRegister] & 0x02) !== 0);
    }

    getRflag() {
        return ((this.r[this.flagsRegister] & 0x04) !== 0);
    }

    getOflag() {
        return ((this.r[this.flagsRegister] & 0x08) !== 0);
    }

    getLflag() {
        return ((this.r[this.flagsRegister] & 0x10) !== 0);
    }

    getEflag() {
        return ((this.r[this.flagsRegister] & 0x20) !== 0);
    }

    getGflag() {
        return ((this.r[this.flagsRegister] & 0x40) !== 0);
    }

    /**
     * Flags raisers
     */

    raiseCflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] | 0x01;
    }

    raiseBflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] | 0x02;
    }

    raiseRflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] | 0x04;
    }

    raiseOflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] | 0x08;
    }

    raiseLflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] | 0x10;
    }

    raiseEflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] | 0x20;
    }

    raiseGflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] | 0x40;
    }

    /**
     * Flags lowers
     */

    lowerCflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] & 0xfe;
    }

    lowerBflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] & 0xfd;
    }

    lowerRflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] & 0xfb;
    }

    lowerOflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] & 0xf7;
    }

    lowerLflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] & 0xef;
    }

    lowerEflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] & 0xdf;
    }

    lowerGflag() {
        this.r[this.flagsRegister] = this.r[this.flagsRegister] & 0xbf;
    }
}