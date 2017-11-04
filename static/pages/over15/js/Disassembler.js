/* exported Disassembler */
"use strict";

class Disassembler {
    constructor() {
        this.binaries = [];
        this.binariesSize = 0;
        this.code = [];
    }

    dissasemble(binaries) {
        this.binaries = binaries; // It should be an Uint8Array(65536)
        this.binariesSize = this.binaries.length;

        for (let i = 0; i < this.binariesSize; i++)
            this.code[i] = "";

        let nibble = 0x0;
        let Rx = 0x0;
        let Ry = 0x0;
        let Rz = 0x0;

        let i = 0;

        while (i < this.binariesSize) {
            switch (this.binaries[i]) {
                case 0x01:
                    this.code[i] = "COPY";
                    this.code[i] += " R" + formatHex((this.binaries[i + 1] & 0xf0) >> 4, 1);
                    this.code[i] += " R" + formatHex(this.binaries[i + 1] & 0x0f, 1);
                    i += 2;
                break;

                case 0x02:
                    this.code[i] = "COPY";

                    nibble = (this.binaries[i + 1] & 0xf0) >> 4;

                    switch (nibble) {
                        case 0x0:
                            this.code[i] += " R" + formatHex(this.binaries[i + 1] & 0x0f, 1);
                            this.code[i] += " " + formatHex(this.binaries[i + 2], 2);
                            this.code[i] += formatHex(this.binaries[i + 3], 2);
                        break;

                        case 0x1:
                            this.code[i] += " " + formatHex(this.binaries[i + 2], 2);
                            this.code[i] += formatHex(this.binaries[i + 3], 2);
                            this.code[i] += " R" + formatHex(this.binaries[i + 1] & 0x0f, 1);
                        break;

                        case 0x2:
                            this.code[i] += " R" + formatHex(this.binaries[i + 1] & 0x0f, 1);
                            this.code[i] += " #" + formatHex(this.binaries[i + 2], 2);
                            this.code[i] += formatHex(this.binaries[i + 3], 2);
                        break;

                        default: 
                            this.code[i] += " -?-";
                    }

                    i += 4;
                break;

                case 0x03:
                    this.code[i] = "COPY";
                    this.code[i] += " R" + formatHex((this.binaries[i + 1] & 0xf0) >> 4, 1);
                    this.code[i] += " *R" + formatHex(this.binaries[i + 1] & 0x0f, 1);
                    i += 2;
                break;

                case 0x04:
                    this.code[i] = "COPY";
                    this.code[i] += " *R" + formatHex((this.binaries[i + 1] & 0xf0) >> 4, 1);
                    this.code[i] += " R" + formatHex(this.binaries[i + 1] & 0x0f, 1);
                    i += 2;
                break;

                case 0x10:
                    this.code[i] = "ADD";
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Ry = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " R" + formatHex(Ry, 1);
                    i += 2;
                break;

                case 0x11:
                    this.code[i] = "SUB";
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Ry = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " R" + formatHex(Ry, 1);
                    i += 2;
                break;

                case 0x12:
                    this.code[i] = "MULT";
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Ry = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " R" + formatHex(Ry, 1);
                    i += 2;
                break;

                case 0x13:
                    this.code[i] = "DIV";
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Ry = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " R" + formatHex(Ry, 1);
                    i += 2;
                break;

                case 0x14:
                    this.code[i] = "INC";
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Ry = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " #" + formatHex(Ry, 1);
                    i += 2;
                break;

                case 0x15:
                    this.code[i] = "DEC";
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Ry = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " #" + formatHex(Ry, 1);
                    i += 2;
                break;

                case 0x20:
                    this.code[i] = "NOT";
                    Rx = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    i += 2;
                break;

                case 0x21:
                    this.code[i] = "INV";
                    Rx = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    i += 2;
                break;

                case 0x22:
                    this.code[i] = "LSH";
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    nibble = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " #" + formatHex(nibble, 1);
                    i += 2;
                break;

                case 0x23:
                    this.code[i] = "RSH";
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    nibble = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " #" + formatHex(nibble, 1);
                    i += 2;
                break;

                case 0x24:
                    this.code[i] = "OR";
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Ry = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " R" + formatHex(Ry, 1);
                    i += 2;
                break;

                case 0x25:
                    this.code[i] = "AND";
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Ry = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " R" + formatHex(Ry, 1);
                    i += 2;
                break;

                case 0x26:
                    this.code[i] = "XOR";
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Ry = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " R" + formatHex(Ry, 1);
                    i += 2;
                break;

                case 0x30:
                    this.code[i] = "CMP";
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Ry = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " R" + formatHex(Ry, 1);
                    i += 2;
                break;

                case 0x40:
                    nibble = (this.binaries[i + 1] & 0xf0) >> 4;
                    Rz = this.binaries[i + 1] & 0x0f;

                    switch (nibble) {
                        case 0x0:
                            this.code[i] = "JE R" + formatHex(Rz, 1);
                            i += 2;
                        break;
                        
                        case 0x1:
                            this.code[i] = "JNE R" + formatHex(Rz, 1);
                            i += 2;
                        break;
                        
                        case 0x2:
                            this.code[i] = "JG R" + formatHex(Rz, 1);
                            i += 2;
                        break;
                        
                        case 0x3:
                            this.code[i] = "JGE R" + formatHex(Rz, 1);
                            i += 2;
                        break;
                        
                        case 0x4:
                            this.code[i] = "JL R" + formatHex(Rz, 1);
                            i += 2;
                        break;
                        
                        case 0x5:
                            this.code[i] = "JLE R" + formatHex(Rz, 1);
                            i += 2;
                        break;
                        
                        case 0x6:
                            this.code[i] = "JC R" + formatHex(Rz, 1);
                            i += 2;
                        break;
                        
                        case 0x7:
                            this.code[i] = "JNC R" + formatHex(Rz, 1);
                            i += 2;
                        break;
                        
                        case 0x8:
                            this.code[i] = "JB R" + formatHex(Rz, 1);
                            i += 2;
                        break;
                        
                        case 0x9:
                            this.code[i] = "JNB R" + formatHex(Rz, 1);
                            i += 2;
                        break;

                        default:
                            this.code[i] = "-?-";
                            i += 1;
                    }
                break;

                case 0x41:
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Rz = this.binaries[i + 1] & 0x0f;
                    this.code[i] = "JZ";
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " R" + formatHex(Rz, 1);
                    i += 2;
                break;

                case 0x42:
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Rz = this.binaries[i + 1] & 0x0f;
                    this.code[i] = "JNZ";
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " R" + formatHex(Rz, 1);
                    i += 2;
                break;

                case 0x43:
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Rz = this.binaries[i + 1] & 0x0f;
                    this.code[i] = "JGZ";
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " R" + formatHex(Rz, 1);
                    i += 2;
                break;

                case 0x44:
                    Rx = (this.binaries[i + 1] & 0xf0) >> 4;
                    Rz = this.binaries[i + 1] & 0x0f;
                    this.code[i] = "JLZ";
                    this.code[i] += " R" + formatHex(Rx, 1);
                    this.code[i] += " R" + formatHex(Rz, 1);
                    i += 2;
                break;

                case 0x50:
                    this.code[i] = "JUMP";
                    this.code[i] += " #" + formatHex(this.binaries[i + 1], 2);
                    this.code[i] += formatHex(this.binaries[i + 2], 2);
                    i += 3;
                break;

                case 0x51:
                    this.code[i] = "JUMP";
                    this.code[i] += " " + formatHex(this.binaries[i + 1], 2);
                    this.code[i] += formatHex(this.binaries[i + 2], 2);
                    i += 3;
                break;

                case 0x52:
                    this.code[i] = "JUMP";
                    this.code[i] += " R" + formatHex(this.binaries[i + 1], 1);
                    i += 2;
                break;

                case 0x60:
                    this.code[i] = "CALL";
                    this.code[i] += " #" + formatHex(this.binaries[i + 1], 2);
                    this.code[i] += formatHex(this.binaries[i + 2], 2);
                    i += 3;
                break;

                case 0x61:
                    this.code[i] = "CALL";
                    this.code[i] += " " + formatHex(this.binaries[i + 1], 2);
                    this.code[i] += formatHex(this.binaries[i + 2], 2);
                    i += 3;
                break;

                case 0x62:
                    this.code[i] = "CALL";
                    this.code[i] += " R" + formatHex(this.binaries[i + 1], 1);
                    i += 2;
                break;

                case 0x63:
                    this.code[i] = "RET";
                    i += 1;
                break;

                case 0x70:
                    this.code[i] = "PUSH";
                    Rx = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    i += 2;
                break;

                case 0x71:
                    this.code[i] = "POP";
                    Rx = this.binaries[i + 1] & 0x0f;
                    this.code[i] += " R" + formatHex(Rx, 1);
                    i += 2;
                break;

                case 0xff:
                    this.code[i] = "NOP";
                    i += 1;
                break;

                case 0x00:
                    this.code[i] = "END";
                    this.fillWithDataFrom(i+1);
                    i = this.binariesSize; // This is so for breaking the loop (breaking the loop, breaking the loop!)
                break;

                default:
                    this.code[i] = "-?-";
                    i += 1;
            }
        }
    }

    fillWithDataFrom(start) {
        for (let i = start; i < this.binariesSize; i++)
            this.code[i] = "-data-";
    }

    getCodeAtLine(line) {
        return this.code[line];
    }
}

function formatHex(value, digits) {
    let baseStr = "";

    for (let i = 0; i < digits; i++)
        baseStr += "0";

    return (baseStr + value.toString(16)).substr(-digits);
}