// EXAMPLE #2: Arrays
// -----------------------------------------
// This program will add 2 to all the 16
// array elements.

// R0 will act as our array object
// R1 will be the array length
// R2 will act as the current array element pointer
// R3 will act as the current array element
// R4 will act as the 'i' counter

// Initializations:
copy r0 array
copy r1 #000f

// For loop:
copy r4 #0000
:forLoop
// For condition:
cmp r4 r1
copy r9 endForLoop
jge r9
    // currentElement = array[i];
    add r0 r4
    copy r2 ra
    copy r3 *r2
    inc r3 #2
    copy *r2 r3
inc r4 #1
jump forLoop
:endForLoop

// The program will "freeze" here, just
// for demonstration in the debugger tool:
:finish
nop
jump finish
end

// This is the array of 16 elements:
:array
04
0d
06
0e
07
0c
03
09
01
0b
0a
08
05
02
0f