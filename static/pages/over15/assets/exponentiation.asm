// EXAMPLE #1: Exponentiation
// -----------------------------------------
// This program will calculate the power
// of a 'base' raised to an 'exponent'.
// It only works well for small results,
// and in this example we have:
// 3^6 = 729 = 0x02d9.

// R0 holds the result:
copy r0 #0000

// R1 holds the base:
copy r1 #0003

// R2 holds the exponent:
copy r2 #0006

// If base == 0, then
// jumps to finsh:
copy r9 finish
jz r1 r9

// If exponent == 0, then
// makes result = 1 and jump to finish:
copy r9 checkExponentEquals1
jnz r2 r9
    copy r0 #0001
jump finish

// Else if R1 == 1, then
// makes result = base and jump to finish:
:checkExponentEquals1
copy r8 #0001
cmp r2 r8
copy r9 powerCalculation
jne r9
    copy r0 r1
jump finish

// Else, calculates the power:
:powerCalculation
copy r0 r1
dec r2 #1
:loop
    mult r0 r1
    copy r0 ra
    dec r2 #1
    copy r9 break
    jz r2 r9
jump loop
:break

// The program will "freeze" here, just
// for demonstration in the debugger tool:
:finish
nop
jump finish
end