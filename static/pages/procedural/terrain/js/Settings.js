/* exported Settings */
"use strict";

let Settings = {

    worldRadius: 4,     // will be the visible chunk radio in the real game (still a square :P)
    radialSight: false, // if true the generator will simulate radial sight from central chunk
    chunkSize: 50,      // in pixels
    
    seed: 31429,

    seaLevel: 0.07, // Range [0.0 to 1.0]

    /*
     *  freq    It could be seen as the "zoom" of the map.
     *          Must be in range [0.0 to +inf).
     *  
     *  octaves Low octaves generates "big continents", "small isles",
     *          combining them will result in "continents with sharp coast lines".
     *          Can be any quantity of positive integers.
     *  
     *  redistribution  Makes the low lands to be even lower. Can be any positive float.
     */

    height: {
        freq: 0.12,
        octavesForRough: [0, 1, 2, 4, 6, 7],
        octavesForSmooth: [0, 1, 2, 7, 8],
        redistribution: 4.5
    },

    temperature: {
        freq: 0.10,
        octaves: [0, 1]
    },

    moisture: {
        freq: 0.10,
        octaves: [0, 1]
    },

    /* All the biomes are:
     *   dst: "Desert"
     *   jgl: "Jungle"
     *   swa: "Swamp"
     *   grl: "Grassland"
     *   dfr: "Decidious Forest"
     *   cfr: "Conifer Forest"
     *   sno: "Snow"
     *   wtr: "Water"
     */

    biomes: [
        ["dst", "grl", "jgl"],
        ["grl", "dfr", "swa"],
        ["sno", "sno", "cfr"]
    ],

    // Just for differenciate one chunk from another:
    gridVisible: false,
    lineLength: 3
};