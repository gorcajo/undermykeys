/* exported settings */
"use strict";

let settings = {
    tileSize: 12,
    width: 39,
    length: 39,

    // For random rectangular rooms:
    roomMinWidth:  5,
    roomMinLength: 5,
    roomMaxWidth:  9,
    roomMaxLength: 9,

    placeAttempts:    500,  // The higher, the more rooms (denser dungeons)
    overlappingRooms: 3,    // The higher, the more rooms overlapping other rooms, making biger rooms and strange shapes
    branchingness:    50,   // The lower, the windier will be the corridors
    extraDoorsChance: 0.65, // The higher, the more possible to exist loop paths
    removalDepth:     5,    // The lower, the more and larger dead-ends in corridors
    
    // Seed between 0 and 65535:
    seed: 0,

    // Colors:
    wallColor:   0xe8e8e8,
    groundColor: 0x2fa1d6,
    gridColor:   0x303030,
    doorColor:   0xffffff
};
