/* globals Level, phaserController, datGuiController, settings */
/* exported dungeonGenerator */
"use strict";

let dungeonGenerator = {

    init: function() {
        phaserController.init();
        datGuiController.init();
        
        window.setTimeout(function() {
            dungeonGenerator.createDungeon();
        }, 50);
    },

    generateRandomSeed: function() {
        settings.seed = Math.floor(Math.random() * 65535);
    },

    createDungeon: function() {

        // Initialization:

        Math.seedrandom(settings.seed);

        phaserController.destroySprites();
        phaserController.refreshCanvasSize();

        let level = new Level(settings.width, settings.length);

        // Dungeon generation:

        level.placeRooms(
            settings.placeAttempts,
            settings.overlappingRooms,
            settings.roomMinWidth,
            settings.roomMinLength,
            settings.roomMaxWidth,
            settings.roomMaxLength);

        level.generateAllCorridors(settings.branchingness);

        level.openDoors(settings.extraDoorsChance);
        
        level.removeDeadEnds(settings.removalDepth);

        // Finish:

        phaserController.drawWholeMap(level);
    }
};