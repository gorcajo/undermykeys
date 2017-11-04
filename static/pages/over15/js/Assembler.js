/* exported Assembler */
"use strict";

class Assembler {
    constructor() {
        this.source = "";

        this.binariesSize = 65536;
        this.binaries = new Uint8Array(this.binariesSize);

        for (let i = 0; i < this.binaries.length; i++)
            this.binaries[i] = "0xff";

        this.successful = false;
        this.resultMessage = "No code written!";
        this.lastAddress = 0x0000;
    }

    setSourceCode(source) {
        this.source = source;
    }

    assemble() {
        let sourceLines = this.source.toUpperCase().split("\n");
        let instructions = [];
        let labels = [];

        for (let i = 0; i < sourceLines.length; i++) {
            sourceLines[i] = sourceLines[i].trim().replace(/\s+/g, " ");

            if (sourceLines[i] !== "") {
                let currentInstruction = {
                    text: sourceLines[i],
                    lineNumber: i + 1
                };

                instructions.push(currentInstruction);
            }
        }

        let currentAddress = 0x0000;

        if (instructions.length <= 0) {
            this.successful = false;
            this.resultMessage = "No code written!";
            this.lastAddress = 0x0000;
        }
        else {
            this.successful = true; // Yes, successful, for now... We'll see what happens inside the for loop...
        }

        // This makes a scan through the code looking for labels and storing their memory positions:

        for (let i = 0; i < instructions.length; i++) {
            let mnemonicAndOperands = instructions[i].text.split(" ");
            let mnemonic = mnemonicAndOperands[0];
            let operands = mnemonicAndOperands.slice(1, mnemonicAndOperands.length);

            // If the line starts with "//", just ignore it:
            if ((mnemonic[0] === "/") && (mnemonic[1] === "/")) {
                continue;
            }
            // If the line starts with ":" and has only one "word", then we have a label and we store the current address counter:
            else if ((mnemonic[0] === ":") && (operands.length === 0)) {
                labels[mnemonic.substr(1)] = currentAddress;
                continue;
            }
            // In any other case, we must increment the address counter depending on the instruction:
            else {
                switch (mnemonic) {
                case "RET":
                case "END":
                case "NOP":
                    currentAddress += 1;
                break;

                case "PUSH":
                case "POP":
                case "ADD":
                case "SUB":
                case "MULT":
                case "DIV":
                case "INC":
                case "DEC":
                case "NOT":
                case "INV":
                case "LSH":
                case "RSH":
                case "OR":
                case "AND":
                case "XOR":
                case "CMP":
                case "JE":
                case "JNE":
                case "JG":
                case "JGE":
                case "JL":
                case "JLE":
                case "JC":
                case "JNC":
                case "JB":
                case "JNB":
                case "JZ":
                case "JNZ":
                case "JGZ":
                case "JLZ":
                    currentAddress += 2;
                break;

                case "COPY":
                    if (isRegister(operands[0]) && isRegister(operands[1]))
                        currentAddress += 2;
                    else if (isRegister(operands[0]) && isPointer(operands[1]))
                        currentAddress += 2;
                    else if (isPointer(operands[0]) && isRegister(operands[1]))
                        currentAddress += 2;
                    else
                        currentAddress += 4;
                break;
                
                case "JUMP":
                    if (isRegister(operands[0]))
                        currentAddress += 2;
                    else
                        currentAddress += 3;
                break;
                
                case "CALL":
                    if (isRegister(operands[0]))
                        currentAddress += 2;
                    else
                        currentAddress += 3;
                break;
                }
            }
        }

        // OK, we have the labels and the addresses they point at, now we will do another scan to actually assemble the code, so:

        currentAddress = 0x0000;

        // This huge for is THE CORE of this thing:

        for (let i = 0; i < instructions.length; i++) {
            let mnemonicAndOperands = instructions[i].text.split(" ");
            let mnemonic = mnemonicAndOperands[0];
            let operands = mnemonicAndOperands.slice(1, mnemonicAndOperands.length);

            let Rx = 0x0;
            let Ry = 0x0;
            let address = 0x0000;
            let pointer = 0x0000;
            let literal = 0x0000;

            // This checks if the line is a commentary and ignores it if so:

            if ((mnemonic[0] === "/") && (mnemonic[1] === "/"))
                continue;

            // This checks if is a label and ignores it if so (in a previous for loop we have all the addresses the labels points at):

            if ((mnemonic[0] === ":") && (operands.length === 0))
                continue;

            // This checks if the line is a literal hex number and asigns it to that memory address if so:

            if (isLiteralByte(mnemonic) && (operands.length === 0)) {
                this.binaries[currentAddress] = getLiteralByte(mnemonic);
                currentAddress += 1;
                this.lastAddress = currentAddress;
                continue;
            }

            // This first switch will only verify the number of operands:

            switch (mnemonic) {

                // 0 operands:

                case "RET":
                case "END":
                case "NOP":
                    if (operands.length !== 0) {
                        this.successful = false;
                        this.resultMessage = mnemonic + " must take no operands and took " + operands.length;
                    }
                break;

                // 1 operand:

                case "NOT":
                case "INV":
                case "JE":
                case "JNE":
                case "JG":
                case "JGE":
                case "JL":
                case "JLE":
                case "JC":
                case "JNC":
                case "JB":
                case "JNB":
                case "JUMP":
                case "CALL":
                case "PUSH":
                case "POP":
                    if (operands.length !== 1) {
                        this.successful = false;
                        this.resultMessage = mnemonic + " must take 1 operand and took " + operands.length;
                    }
                break;

                // 2 operands:

                case "COPY":
                case "ADD":
                case "SUB":
                case "MULT":
                case "DIV":
                case "INC":
                case "DEC":
                case "LSH":
                case "RSH":
                case "OR":
                case "AND":
                case "XOR":
                case "CMP":
                case "JZ":
                case "JNZ":
                case "JGZ":
                case "JLZ":
                    if (operands.length !== 2) {
                        this.successful = false;
                        this.resultMessage = mnemonic + " must take 2 operands and took " + operands.length;
                    }
                break;

                default:
                    this.successful = false;
                    this.resultMessage = "Unknown mnemonic " + mnemonic;
            }

            // If the previous switch wrote false into this.successful means we had an error and we exit:

            if (this.successful === false) {
                this.resultMessage = "Error at line " + instructions[i].lineNumber + ":\n\n" + this.resultMessage;
                this.lastAddress = 0x0000;
                break;
            }

            // This second switch interprets the operands:

            switch (mnemonic) {

                // One Register:

                case "NOT":
                case "INV":
                case "JE":
                case "JNE":
                case "JG":
                case "JGE":
                case "JL":
                case "JLE":
                case "JC":
                case "JNC":
                case "JB":
                case "JNB":
                case "PUSH":
                case "POP":
                    if (isRegister(operands[0])) {
                        Rx = getRegister(operands[0]);
                    }
                    else {
                        this.successful = false;
                        this.resultMessage = "Operand not valid";
                        break;
                    }
                break;

                // Two registers:

                case "ADD":
                case "SUB":
                case "MULT":
                case "DIV":
                case "OR":
                case "AND":
                case "XOR":
                case "CMP":
                case "JZ":
                case "JNZ":
                case "JGZ":
                case "JLZ":
                    if (isRegister(operands[0]) && isRegister(operands[1])) {
                        Rx = getRegister(operands[0]);
                        Ry = getRegister(operands[1]);
                    }
                    else {
                        this.successful = false;
                        this.resultMessage = "Operands not valid";
                        break;
                    }
                break;

                // A register and a literal nibble:

                case "INC":
                case "DEC":
                case "LSH":
                case "RSH":
                    if (isRegister(operands[0]) && isLiteralNibble(operands[1])) {
                        Rx = getRegister(operands[0]);
                        literal = getLiteralNibble(operands[1]);
                    }
                    else {
                        this.successful = false;
                        this.resultMessage = "Operands not valid";
                        break;
                    }
                break;

                // Misc:

                case "COPY":
                case "JUMP":
                case "CALL":
                    // For these cases we do nothing, 'cause they receive different types of operands
                    // We'll interpret these operands in the next switch statement
                break;
            }

            // Finally this third switch assigns the opcode (THIS is the mother of the lamb):

            switch (mnemonic) {

                // Assign instructions ////////////////////////////////////////////////////////////////////////////////

                case "COPY":
                    if (isRegister(operands[0]) && isRegister(operands[1])) {                             // COPY Rx Ry
                        Rx = getRegister(operands[0]);
                        Ry = getRegister(operands[1]);

                        this.binaries[currentAddress] = 0x01;
                        this.binaries[currentAddress + 1] = (Rx << 4) + Ry;

                        currentAddress += 2;
                    }
                    else if (isRegister(operands[0]) && isAddress(operands[1])) {                       // COPY Rx nnnn
                        Rx = getRegister(operands[0]);
                        address = getAddress(operands[1]);

                        this.binaries[currentAddress] = 0x02;
                        this.binaries[currentAddress + 1] = 0x00 + Rx;
                        this.binaries[currentAddress + 2] = (address & 0xff00) >> 8;
                        this.binaries[currentAddress + 3] = address & 0x00ff;

                        currentAddress += 4;
                    }
                    else if (isAddress(operands[0]) && isRegister(operands[1])) {                       // COPY nnnn Rx
                        address = getAddress(operands[0]);
                        Rx = getRegister(operands[1]);

                        this.binaries[currentAddress] = 0x02;
                        this.binaries[currentAddress + 1] = 0x10 + Rx;
                        this.binaries[currentAddress + 2] = (address & 0xff00) >> 8;
                        this.binaries[currentAddress + 3] = address & 0x00ff;

                        currentAddress += 4;
                    }
                    else if (isRegister(operands[0]) && isLiteral(operands[1])) {                      // COPY Rx #nnnn
                        Rx = getRegister(operands[0]);
                        literal = getLiteral(operands[1]);

                        this.binaries[currentAddress] = 0x02;
                        this.binaries[currentAddress + 1] = 0x20 + Rx;
                        this.binaries[currentAddress + 2] = (literal & 0xff00) >> 8;
                        this.binaries[currentAddress + 3] = literal & 0x00ff;

                        currentAddress += 4;
                    }
                    else if (isRegister(operands[0]) && (operands[1] in labels)) {                        // COPY label
                        Rx = getRegister(operands[0]);

                        this.binaries[currentAddress] = 0x02;
                        this.binaries[currentAddress + 1] = 0x20 + Rx;
                        this.binaries[currentAddress + 2] = (labels[operands[1]] & 0xff00) >> 8;
                        this.binaries[currentAddress + 3] = labels[operands[1]] & 0x00ff;

                        currentAddress += 4;
                    }
                    else if (isRegister(operands[0]) && isPointer(operands[1])) {                        // COPY Rx *Ry
                        Rx = getRegister(operands[0]);
                        pointer = getPointer(operands[1]);

                        this.binaries[currentAddress] = 0x03;
                        this.binaries[currentAddress + 1] = (Rx << 4) + pointer;

                        currentAddress += 2;
                    }
                    else if (isPointer(operands[0]) && isRegister(operands[1])) {                        // COPY *Rx Ry
                        pointer = getPointer(operands[0]);
                        Ry = getRegister(operands[1]);

                        this.binaries[currentAddress] = 0x04;
                        this.binaries[currentAddress + 1] = (pointer << 4) + Ry;

                        currentAddress += 2;
                    }
                    else {
                        this.successful = false;
                        this.resultMessage = "Operands not valid";
                    }
                break;

                // Math instructions //////////////////////////////////////////////////////////////////////////////////

                case "ADD":                                                                                // ADD Rx Ry
                    this.binaries[currentAddress] = 0x10;
                    this.binaries[currentAddress + 1] = (Rx << 4) + Ry;
                    currentAddress += 2;
                break;

                case "SUB":                                                                                // SUB Rx Ry
                    this.binaries[currentAddress] = 0x11;
                    this.binaries[currentAddress + 1] = (Rx << 4) + Ry;
                    currentAddress += 2;
                break;
                
                case "MULT":                                                                              // MULT Rx Ry
                    this.binaries[currentAddress] = 0x12;
                    this.binaries[currentAddress + 1] = (Rx << 4) + Ry;
                    currentAddress += 2;
                break;
                
                case "DIV":                                                                                // DIV Rx Ry
                    this.binaries[currentAddress] = 0x13;
                    this.binaries[currentAddress + 1] = (Rx << 4) + Ry;
                    currentAddress += 2;
                break;
                
                case "INC":                                                                                // INC Rx #i
                    this.binaries[currentAddress] = 0x14;
                    this.binaries[currentAddress + 1] = (Rx << 4) + literal;
                    currentAddress += 2;
                break;
                
                case "DEC":                                                                                // DEC Rx #i
                    this.binaries[currentAddress] = 0x15;
                    this.binaries[currentAddress + 1] = (Rx << 4) + literal;
                    currentAddress += 2;
                break;

                // Bitwise instructions ///////////////////////////////////////////////////////////////////////////////

                case "NOT":                                                                                   // NOT Rx
                    this.binaries[currentAddress] = 0x20;
                    this.binaries[currentAddress + 1] = Rx;
                    currentAddress += 2;
                break;
                
                case "INV":                                                                                   // INV Rx
                    this.binaries[currentAddress] = 0x21;
                    this.binaries[currentAddress + 1] = Rx;
                    currentAddress += 2;
                break;
                
                case "LSH":                                                                                   // LSH Rx
                    this.binaries[currentAddress] = 0x22;
                    this.binaries[currentAddress + 1] = (Rx << 4) + literal;
                    currentAddress += 2;
                break;
                
                case "RSH":                                                                                   // RSH Rx
                    this.binaries[currentAddress] = 0x23;
                    this.binaries[currentAddress + 1] = (Rx << 4) + literal;
                    currentAddress += 2;
                break;
                
                case "OR":                                                                                  // OR Rx Ry
                    this.binaries[currentAddress] = 0x24;
                    this.binaries[currentAddress + 1] = (Rx << 4) + Ry;
                    currentAddress += 2;
                break;
                
                case "AND":                                                                                // AND Rx Ry
                    this.binaries[currentAddress] = 0x25;
                    this.binaries[currentAddress + 1] = (Rx << 4) + Ry;
                    currentAddress += 2;
                break;
                
                case "XOR":                                                                                // XOR Rx Ry
                    this.binaries[currentAddress] = 0x26;
                    this.binaries[currentAddress + 1] = (Rx << 4) + Ry;
                    currentAddress += 2;
                break;

                // Compare instructions ///////////////////////////////////////////////////////////////////////////////

                case "CMP":                                                                                // CMP Rx Ry
                    this.binaries[currentAddress] = 0x30;
                    this.binaries[currentAddress + 1] = (Rx << 4) + Ry;
                    currentAddress += 2;
                break;

                // Conditional jump instructions //////////////////////////////////////////////////////////////////////

                case "JE":                                                                                     // JE Rz
                    this.binaries[currentAddress] = 0x40;
                    this.binaries[currentAddress + 1] = 0x00 + Rx;
                    currentAddress += 2;
                break;

                case "JNE":                                                                                   // JNE Rz
                    this.binaries[currentAddress] = 0x40;
                    this.binaries[currentAddress + 1] = 0x10 + Rx;
                    currentAddress += 2;
                break;

                case "JG":                                                                                     // JG Rz
                    this.binaries[currentAddress] = 0x40;
                    this.binaries[currentAddress + 1] = 0x20 + Rx;
                    currentAddress += 2;
                break;

                case "JGE":                                                                                   // JGE Rz
                    this.binaries[currentAddress] = 0x40;
                    this.binaries[currentAddress + 1] = 0x30 + Rx;
                    currentAddress += 2;
                break;

                case "JL":                                                                                     // JL Rz
                    this.binaries[currentAddress] = 0x40;
                    this.binaries[currentAddress + 1] = 0x40 + Rx;
                    currentAddress += 2;
                break;

                case "JLE":                                                                                   // JLE Rz
                    this.binaries[currentAddress] = 0x40;
                    this.binaries[currentAddress + 1] = 0x50 + Rx;
                    currentAddress += 2;
                break;

                case "JC":                                                                                     // JC Rz
                    this.binaries[currentAddress] = 0x40;
                    this.binaries[currentAddress + 1] = 0x60 + Rx;
                    currentAddress += 2;
                break;

                case "JNC":                                                                                   // JNC Rz
                    this.binaries[currentAddress] = 0x40;
                    this.binaries[currentAddress + 1] = 0x70 + Rx;
                    currentAddress += 2;
                break;

                case "JB":                                                                                     // JB Rz
                    this.binaries[currentAddress] = 0x40;
                    this.binaries[currentAddress + 1] = 0x80 + Rx;
                    currentAddress += 2;
                break;

                case "JNB":                                                                                   // JNB Rz
                    this.binaries[currentAddress] = 0x40;
                    this.binaries[currentAddress + 1] = 0x90 + Rx;
                    currentAddress += 2;
                break;

                case "JZ":                                                                                  // JZ Rx Rz
                    this.binaries[currentAddress] = 0x41;
                    this.binaries[currentAddress + 1] = (Rx << 4) + Ry;
                    currentAddress += 2;
                break;

                case "JNZ":                                                                                // JNZ Rx Rz
                    this.binaries[currentAddress] = 0x42;
                    this.binaries[currentAddress + 1] = (Rx << 4) + Ry;
                    currentAddress += 2;
                break;

                case "JGZ":                                                                                // JGZ Rx Rz
                    this.binaries[currentAddress] = 0x43;
                    this.binaries[currentAddress + 1] = (Rx << 4) + Ry;
                    currentAddress += 2;
                break;

                case "JLZ":                                                                                // JLZ Rx Rz
                    this.binaries[currentAddress] = 0x44;
                    this.binaries[currentAddress + 1] = (Rx << 4) + Ry;
                    currentAddress += 2;
                break;

                // Unconditional jump instructions ////////////////////////////////////////////////////////////////////

                case "JUMP":
                    if (isLiteral(operands[0])) {                                                         // JUMP #nnnn
                        literal = getLiteral(operands[0]);

                        this.binaries[currentAddress] = 0x50;
                        this.binaries[currentAddress + 1] = (literal & 0xff00) >> 8;
                        this.binaries[currentAddress + 2] = literal & 0x00ff;

                        currentAddress += 3;
                    }
                    else if (isAddress(operands[0])) {                                                     // JUMP nnnn
                        address = getAddress(operands[0]);

                        this.binaries[currentAddress] = 0x51;
                        this.binaries[currentAddress + 1] = (address & 0xff00) >> 8;
                        this.binaries[currentAddress + 2] = address & 0x00ff;

                        currentAddress += 3;
                    }
                    else if (isRegister(operands[0])) {                                                      // JUMP Rx
                        Rx = getRegister(operands[0]);

                        this.binaries[currentAddress] = 0x52;
                        this.binaries[currentAddress + 1] = 0x00 + Rx;

                        currentAddress += 2;
                    }
                    else if (operands[0] in labels) {                                                     // JUMP label
                        this.binaries[currentAddress] = 0x50;
                        this.binaries[currentAddress + 1] = (labels[operands[0]] & 0xff00) >> 8;
                        this.binaries[currentAddress + 2] = labels[operands[0]] & 0x00ff;
                        currentAddress += 3;
                    }
                    else {
                        this.successful = false;
                        this.resultMessage = "Operands not valid";
                    }
                break;

                // Call instructions //////////////////////////////////////////////////////////////////////////////////

                case "CALL":
                    if (isLiteral(operands[0])) {                                                         // CALL #nnnn
                        literal = getLiteral(operands[0]);

                        this.binaries[currentAddress] = 0x60;
                        this.binaries[currentAddress + 1] = (literal & 0xff00) >> 8;
                        this.binaries[currentAddress + 2] = literal & 0x00ff;

                        currentAddress += 3;
                    }
                    else if (isAddress(operands[0])) {                                                     // CALL nnnn
                        address = getAddress(operands[0]);

                        this.binaries[currentAddress] = 0x61;
                        this.binaries[currentAddress + 1] = (address & 0xff00) >> 8;
                        this.binaries[currentAddress + 2] = address & 0x00ff;

                        currentAddress += 3;
                    }
                    else if (isRegister(operands[0])) {                                                      // CALL Rx
                        Rx = getRegister(operands[0]);

                        this.binaries[currentAddress] = 0x62;
                        this.binaries[currentAddress + 1] = 0x00 + Rx;

                        currentAddress += 2;
                    }
                    else if (operands[0] in labels) {                                                     // CALL label
                        this.binaries[currentAddress] = 0x60;
                        this.binaries[currentAddress + 1] = (labels[operands[0]] & 0xff00) >> 8;
                        this.binaries[currentAddress + 2] = labels[operands[0]] & 0x00ff;
                        currentAddress += 3;
                    }
                    else {
                        this.successful = false;
                        this.resultMessage = "Operands not valid";
                    }
                break;

                case "RET":                                                                                      // RET
                    this.binaries[currentAddress] = 0x63;
                    currentAddress += 1;
                break;

                // Stack instructions /////////////////////////////////////////////////////////////////////////////////

                case "PUSH":                                                                                 // PUSH Rx
                    this.binaries[currentAddress] = 0x70;
                    this.binaries[currentAddress + 1] = 0x00 + Rx;
                    currentAddress += 2;
                break;

                case "POP":                                                                                   // POP Rx
                    this.binaries[currentAddress] = 0x71;
                    this.binaries[currentAddress + 1] = 0x00 + Rx;
                    currentAddress += 2;
                break;

                // Other instructions /////////////////////////////////////////////////////////////////////////////////

                case "END":                                                                                      // END
                    this.binaries[currentAddress] = 0x00;
                    currentAddress += 1;
                break;

                case "NOP":                                                                                      // NOP
                    this.binaries[currentAddress] = 0xff;
                    currentAddress += 1;
                break;
            }

            // If the previous switch wrote false into this.successful is an error and we exit,
            // otherwise updates the last address assembled and continues the loop:

            if (this.successful === false) {
                this.resultMessage = "Error at line " + instructions[i].lineNumber + ":\n\n" + this.resultMessage;
                this.lastAddress = 0x0000;
                break;
            }
            else {
                this.lastAddress = currentAddress;
            }
        }

        // This prevents a successful assembly with a code containing only comments:

        if ((this.successful === true) && (this.lastAddress === 0)) {
            this.successful = false;
            this.resultMessage = "No code written!";
            this.lastAddress = 0x0000;
        }
    }

    wasSuccessful() {
        return this.successful;
    }

    getResultMessage() {
        return this.resultMessage;
    }

    getBinaries() {
        return this.binaries;
    }

    getLastAddress() {
        return this.lastAddress;
    }
}

// Operand check and extractors:

function isRegister(operand) {
    if (/^[R][0-9A-F]$/g.test(operand))
        return true;
    else
        return false;
}

function getRegister(operand) {
    if (isRegister(operand))
        return string2hex(/[0-9A-F]/g.exec(operand)[0]);
    else
        throw new Error("The operand " + operand + " is not a register");
}

function isAddress(operand) {
    if (/^[0-9A-F]{4}$/g.test(operand))
        return true;
    else
        return false;
}

function getAddress(operand) {
    if (isAddress(operand))
        return string2hex(/[0-9A-F]{4}/g.exec(operand)[0]);
    else
        throw new Error("The operand " + operand + " is not an address");
}

function isPointer(operand) {
    if (/^[*][R][0-9A-F]$/g.test(operand)) {
        return true;
    }
    else
        return false;
}

function getPointer(operand) {
    if (isPointer(operand))
        return string2hex(/[0-9A-F]/g.exec(operand)[0]);
    else
        throw new Error("The operand " + operand + " is not a pointer");
}

function isLiteralNibble(operand) {
    if (/^[#][0-9A-F]{1}$/g.test(operand))
        return true;
    else
        return false;
}

function getLiteralNibble(operand) {
    if (isLiteralNibble(operand))
        return string2hex(/[0-9A-F]{1}/g.exec(operand)[0]);
    else
        throw new Error("The operand " + operand + " is not a literal nibble");
}

function isLiteralByte(operand) {
    if (/^[0-9A-F]{2}$/g.test(operand))
        return true;
    else
        return false;
}

function getLiteralByte(operand) {
    if (isLiteralByte(operand))
        return string2hex(/[0-9A-F]{2}/g.exec(operand)[0]);
    else
        throw new Error("The operand " + operand + " is not a literal nibble");
}

function isLiteral(operand) {
    if (/^[#][0-9A-F]{4}$/g.test(operand))
        return true;
    else
        return false;
}

function getLiteral(operand) {
    if (isLiteral(operand))
        return string2hex(/[0-9A-F]{4}/g.exec(operand)[0]);
    else
        throw new Error("The operand " + operand + " is not a literal");
}

// Tools:

function string2hex(string) {
    let hex = 0x0000;
    let nibble = 0x0;

    for (let i = 0; i < string.length; i++) {
        switch (string[i]) {
            case "0":
                nibble = 0x0;
                break;
            case "1":
                nibble = 0x1;
                break;
            case "2":
                nibble = 0x2;
                break;
            case "3":
                nibble = 0x3;
                break;
            case "4":
                nibble = 0x4;
                break;
            case "5":
                nibble = 0x5;
                break;
            case "6":
                nibble = 0x6;
                break;
            case "7":
                nibble = 0x7;
                break;
            case "8":
                nibble = 0x8;
                break;
            case "9":
                nibble = 0x9;
                break;
            case "A":
            case "a":
                nibble = 0xa;
                break;
            case "B":
            case "b":
                nibble = 0xb;
                break;
            case "C":
            case "c":
                nibble = 0xc;
                break;
            case "D":
            case "d":
                nibble = 0xd;
                break;
            case "E":
            case "e":
                nibble = 0xe;
                break;
            case "F":
            case "f":
                nibble = 0xf;
                break;
            default:
                throw new Error("Impossible to convert the string " + string + " to hex");
        }

        hex += nibble << ((string.length - i - 1) * 4);
    }

    return hex;
}