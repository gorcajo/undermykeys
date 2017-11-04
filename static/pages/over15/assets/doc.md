## 1. Features

* 16-bit microcontroller.
* Internal memory:
    * 64 KiB.
    * `PC` starting at `0x0000`.
    * Instructions stored big-endian.
* Registers: 
    * 16-bit registers.
    * `R0`~`R9`: General purpose registers.
    * `Ra`: Accumulator.
    * `Rb`: B Accumulator.
    * `Rc`: Port C.
    * `Rd`: Port D.
    * `Re`: Stack Pointer.
    * `Rf`: Current Program Status Flags.
* Stack:
    * 16 levels.
    * 4-bit `SP`.
    * `SP`, starting at `0x0`.
    * Outside of the internal memory.
* I/O Ports:
    * 8 lines each one.
    * Port `Pc` mapped at register `Rc`.
    * Port `Pd` mapped at register `Rd`.
* Integer arithmetic only.
* No signed arithmetic. The only instruction using two's complement is `JLZ`.
* No interrupts, timers, counters, watchdog or anything else.
* Virtual Machine implemented in JavaScript for browser.

## 2. Registers

Every single one of the following registers can be accessed freely with any instruction that allows to read from or write in a register.

Nevertheless, it is not recommendable to happily manipulate any register: an empty cell in the below table means an unused bit, thus, those bits are at programmer's disposal; however, the rest of them are bits with special functions, so you have to know what you're doing if you'll manipulate them.

| Register | bit15 | bit14 | bit13 | bit12 | bit11 | bit10 | bit9 | bit8 | bit7 | bit6 | bit5 | bit4 | bit3 | bit2 | bit1 | bit0 | Description                  |
|:--------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:-----------------------------|
| `R0`     |       |       |       |       |       |       |      |      |      |      |      |      |      |      |      |      | *General purpose register 0* |
| `R1`     |       |       |       |       |       |       |      |      |      |      |      |      |      |      |      |      | *General purpose register 1* |
| `R2`     |       |       |       |       |       |       |      |      |      |      |      |      |      |      |      |      | *General purpose register 2* |
| `R3`     |       |       |       |       |       |       |      |      |      |      |      |      |      |      |      |      | *General purpose register 3* |
| `R4`     |       |       |       |       |       |       |      |      |      |      |      |      |      |      |      |      | *General purpose register 4* |
| `R5`     |       |       |       |       |       |       |      |      |      |      |      |      |      |      |      |      | *General purpose register 5* |
| `R6`     |       |       |       |       |       |       |      |      |      |      |      |      |      |      |      |      | *General purpose register 6* |
| `R7`     |       |       |       |       |       |       |      |      |      |      |      |      |      |      |      |      | *General purpose register 7* |
| `R8`     |       |       |       |       |       |       |      |      |      |      |      |      |      |      |      |      | *General purpose register 8* |
| `R9`     |       |       |       |       |       |       |      |      |      |      |      |      |      |      |      |      | *General purpose register 9* |
| `Ra`     | ~     | ~     | ~     | ~     | ~     | ~     | ~    | ~    | ~    | ~    | ~    | ~    | ~    | ~    | ~    | ~    | *Accumulator*                |
| `Rb`     | ~     | ~     | ~     | ~     | ~     | ~     | ~    | ~    | ~    | ~    | ~    | ~    | ~    | ~    | ~    | ~    | *B Accumulator*              |
| `Rc`     |       |       |       |       |       |       |      |      | ~    | ~    | ~    | ~    | ~    | ~    | ~    | ~    | *Port C*                     |
| `Rd`     |       |       |       |       |       |       |      |      | ~    | ~    | ~    | ~    | ~    | ~    | ~    | ~    | *Port D*                     |
| `Re`     |       |       |       |       |       |       |      |      |      |      |      |      | ~    | ~    | ~    | ~    | *Stack Pointer*              |
| `Rf`     |       |       |       |       |       |       |      |      |      | `G`  | `E`  | `L`  | `O`  | `R`  | `B`  | `C`  | *Flags*                      |

`PC` is not directly accessible through registers. However, the instruction `JUMP #nnnn` will write directly into the `PC`.

The `Rf` register contains the Current Program Status Flags, described in this table:

| Flag               | bit    | Name | Dedscription                                                                 |
|:-------------------|:------:|:----:|:-----------------------------------------------------------------------------|
| **Carry**          | `Rf.0` | `C`  | Set after an `ADD` operation, if the result is greater than 16 bits          |
| **Borrow**         | `Rf.1` | `B`  | Set after an `SUB` operation, if the result is lesser than 0                 |
| **Error**          | `Rf.2` | `R`  | See below this table                                                         |
| **Stack Overflow** | `Rf.3` | `O`  | Set if there is a stack overflow                                             |
| **Less-than**      | `Rf.4` | `L`  | Set if the first argument of a `CMP` operation is less than the other one    |
| **Equals**         | `Rf.5` | `E`  | Set if the first argument of a `CMP` operation is equal to the other one     |
| **Greater-than**   | `Rf.6` | `G`  | Set if the first argument of a `CMP` operation is greater than the other one |

The error flag will be set if:
* The opcode is not valid.
* An instruction tries to increment the `PC` over `0xffff` (example: a `NOP` instruction at memory position `0xffff`).
* A `DIV` instruction tries to divide by zero.

Since there is not possible to do signed arithmetic, there is no need of an "overflow flag". The only instruction aware of two's complement is `JLZ`.

## 3. Instruction set

* **Legend**:
    * `nnnn`: The 8-bit value located at memory position `0xnnnn`.
    * `#nnnn`: A literal 16-bit value.
    * `x`, `y`: A 4-bit value representing one of the 16 registers.
    * `Rx`, `Ry`, `Rz`: The 16-bit value of one of the 16 registers.
    * `#i`: A literal 4-bit value.

### 3.0. Assign operations

#### 3.0.1. Direct assignments

| OpCode     | Mnemonic & Operands | Bytes | Description                                                           |
|:-----------|:--------------------|:-----:|:----------------------------------------------------------------------|
| `01xy`     | `COPY Rx Ry`        |  2    | `Rx = Ry`                                                             |
| `020xnnnn` | `COPY Rx nnnn`      |  4    | Sets the least-significant byte of `Rx` to the memory value at `nnnn` |
| `021xnnnn` | `COPY nnnn Rx`      |  4    | Sets the memory value at `nnnn` to least-significant byte of `Rx`     |
| `022xnnnn` | `COPY Rx #nnnn`     |  4    | Sets `Rx` to the literal value `nnnn`                                 |

#### 3.0.2. Indirect assignments

| OpCode     | Mnemonic & Operands | Bytes | Description                                                                 |
|:-----------|:--------------------|:-----:|:----------------------------------------------------------------------------|
| `03xy`     | `COPY Rx *Ry`       |  2    | Sets the least-significant byte of `Rx` to the value pointed by `Ry`        |
| `04xy`     | `COPY *Rx Ry`       |  2    | Sets the memory value pointed by `Rx` to the least-significant byte of `Ry` |

### 3.1. Math operations

| OpCode | Mnemonic & Operands | Bytes | Description                                                                |
|:-------|:--------------------|:-----:|:---------------------------------------------------------------------------|
| `10xy` | `ADD Rx Ry`         |  2    | `Ra = Rx + Ry`, setting the `C` flag if the result is greater than 16 bits |
| `11xy` | `SUB Rx Ry`         |  2    | `Ra = Rx - Ry`, setting the `B` flag if the result is negative             |
| `12xy` | `MULT Rx Ry`        |  2    | Sets `Ra` and `Rb` to `Rx * Ry`, being `Rb` the most-significant byte      |
| `13xy` | `DIV Rx Ry`         |  2    | `Ra = Rx / Ry` and `Rb = Rx % Ry`, setting the `R` flag if `Ry` is zero    |
| `14xi` | `INC Rx #i`         |  2    | `Rx = Rx + i`, setting the `C` flag if the result is greater than 16 bits  |
| `15xi` | `DEC Rx #i`         |  2    | `Rx = Rx - i`, setting the `B` flag if the result is negative              |

### 3.2. Bitwise operations

| OpCode | Mnemonic & Operands | Bytes | Description                                               |
|:-------|:--------------------|:-----:|:----------------------------------------------------------|
| `200x` | `NOT Rx`            |  2    | Sets `Ra` to `not Rx`                                     |
| `210x` | `INV Rx`            |  2    | Sets `Rx` to `not Rx`                                     |
| `22xi` | `LSH Rx #i`         |  2    | Sets `Rx` to `Rx << i`, shifting in zeroes from the right |
| `23xi` | `RSH Rx #i`         |  2    | Sets `Rx` to `Rx >> i`, discarding bits shifted off       |
| `24xy` | `OR  Rx Ry`         |  2    | Sets `Ra` to `Rx or Ry`                                   |
| `25xy` | `AND Rx Ry`         |  2    | Sets `Ra` to `Rx and Ry`                                  |
| `26xy` | `XOR Rx Ry`         |  2    | Sets `Ra` to `Rx xor Ry`                                  |

### 3.3. Compare operations

This instruction are thought to be used immediately before a conditional jump instruction, although it is not mandatory:

| OpCode | Mnemonic & Operands | Bytes | Description                                         |
|:-------|:--------------------|:-----:| :---------------------------------------------------|
| `30xy` | `CMP Rx Ry`         |  2    | Compare Rx and Ry, setting `G`, `E`, and `L` flags. |

### 3.4. Conditional jump operations

#### 3.4.1. Compare-operation-dependant conditional jumps

These instructions are thought to be used immediately after the `CMP` instruction, although it is not mandatory:

| OpCode | Mnemonic & Operands | Bytes | Jumps to instruction pointed by `Rz` if... |
|:-------|:--------------------|:-----:|:-------------------------------------------|
| `400z` | `JE Rz`             |  2    | `E == 1`                                   |
| `401z` | `JNE Rz`            |  2    | `E == 0`                                   |
| `402z` | `JG Rz`             |  2    | `G == 1`                                   |
| `403z` | `JGE Rz`            |  2    | `(E == 1) or (G == 1)`                     |
| `404z` | `JL Rz`             |  2    | `L == 1`                                   |
| `405z` | `JLE Rz`            |  2    | `(E == 1) or (L == 1)`                     |
| `406z` | `JC Rz`             |  2    | `C == 1`                                   |
| `407z` | `JNC Rz`            |  2    | `C == 0`                                   |
| `408z` | `JB Rz`             |  2    | `B == 1`                                   |
| `409z` | `JNB Rz`            |  2    | `B == 0`                                   |

#### 3.4.2. Compare-with-zero conditional jumps

| OpCode | Mnemonic & Operands | Bytes | Jumps to instruction pointed by `Rz` if... |
|:-------|:--------------------|:-----:|:-------------------------------------------|
| `41xz` | `JZ Rx Rz`          |  2    | `Rx == 0`                                  |
| `42xz` | `JNZ Rx Rz`         |  2    | `Rx != 0`                                  |
| `43xz` | `JGZ Rx Rz`         |  2    | `Rx > 0`                                   |
| `44xz` | `JLZ Rx Rz`         |  2    | `Rx < 0` *(two's complement)*              |

### 3.5. Unconditional jump operations

| OpCode   | Mnemonic & Operands | Bytes | Unconditional jump to...          |
|:---------|:--------------------|:-----:|:----------------------------------|
| `50nnnn` | `JUMP #nnnn`        |  3    | The instruction at `nnnn`         |
| `51nnnn` | `JUMP nnnn`         |  3    | The instruction pointed by `nnnn` |
| `520x`   | `JUMP Rx`           |  2    | The instruction pointed by `Rx`   |

### 3.6. Call operations

| OpCode   | Mnemonic & Operands | Bytes | Description                                                                                              |
|:---------|:--------------------|:-----:|:---------------------------------------------------------------------------------------------------------|
| `60nnnn` | `CALL #nnnn`        |  3    | Stores `PC + 3` into the stack and jumps to the instruction at `nnnn`, sets `O` if the stack is full     |
| `61nnnn` | `CALL nnnn`         |  3    | Stores `PC + 3` into the stack and jumps to instruction pointed by `nnnn`, sets `O` if the stack is full |
| `620x`   | `CALL Rx`           |  2    | Stores `PC + 2` into the stack and jumps to instruction pointed by `Rx`, sets `O` if the stack is full   |
| `63`     | `RET`               |  1    | Jumps to the stack's last instruction and removes it from the stack, sets `R` if the stack is empty      |

**Note**: When `O` flag is set means the `CALL` instruction was ignored.

### 3.7. Stack operations

| OpCode | Mnemonic & Operands | Bytes | Description                                                                       |
|:-------|:--------------------|:-----:|:----------------------------------------------------------------------------------|
| `700x` | `PUSH Rx`           |  2    | Adds `Rx` to the stack, setting `O` if the stack is already full                  |
| `710x` | `POP Rx`            |  2    | Sets `Rx` to the stack's last element, and removes it from the stack if not empty |

### 3.8. Other operations

| OpCode | Mnemonic & Operands | Bytes | Description                                       |
|:-------|:--------------------|:-----:|:--------------------------------------------------|
| `00`   | `END`               |  1    | Unconditional jump to the instruction at `0x0000` |
| `FF`   | `NOP`               |  1    | Performs nothing                                  |

The `END` instruction defines the end of the code section and the begining of the data section. This instruction is thought as an aid to the disassember/debugger to differenciate data from code.

However, both sections (code and data) are read-write: nothing avoids the programmer to make an unconditional jump to the data section (in fact the virtual machine will interpret whatever it founds there), or to write into the code section and change the code in "execution time".

Additionally, the programmer don't have to make use of the `END` instruction at all, he/she could igore it and never use it.

## 4. Assembly language

* General rules:
    * Each line mustn't contain more than one instruction.
    * A line may be empty or filled with spaces, in such case the assembler will ignore that line.
    * All spaces before or after an instruction will be ignored.
    * All spaces between operands or between mnemonic and operands count as one.
    * The whole language is not case sensitive.
* A label can be defined with a line starting with `:` character and no spaces between that character and the label identifier.
* All instructions that accepts a 16-bit literal, `#nnnn`, are usable with a label.
* If a line only contains two hexadecimal digits it will be assembled as is.
    * *Example: if you write `a0` in a line, the assembler will write `a0` in that memory address.*
* Any line starting with `//` will be treated as a comment and will be ignored. Inline comments are not allowed.

See examples in the assembler tool for more details.
