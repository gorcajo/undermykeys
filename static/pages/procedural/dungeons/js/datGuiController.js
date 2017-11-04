/* globals dungeonGenerator, settings, dat */
/* exported datGuiController */
"use strict";

let datGuiController = {

    gui: {},

    init: function() {
        this.gui = new dat.GUI({ autoplace: false, width: 300 });

        let customContainer = document.getElementById('datgui-container');
        customContainer.appendChild(this.gui.domElement);

        let f1 = this.gui.addFolder("General settings");
        f1.add(settings, 'tileSize', 2, 20).step(1);
        let controllerWidth = f1.add(settings, 'width', 9, 199).step(1);
        let controllerLength = f1.add(settings, 'length', 9, 199).step(1);
        f1.add(settings, 'seed', 0, 65535).step(1);
        f1.open();

        let f2 = this.gui.addFolder("Rooms phase settings");
        let controllerRoomMinWidth = f2.add(settings, 'roomMinWidth', 3, 13).step(1);
        let controllerRoomMaxWidth = f2.add(settings, 'roomMaxWidth', 3, 13).step(1);
        let controllerRoomMinLength = f2.add(settings, 'roomMinLength', 3, 13).step(1);
        let controllerRoomMaxLength = f2.add(settings, 'roomMaxLength', 3, 13).step(1);
        f2.add(settings, 'placeAttempts', 10, 1000).step(10);
        f2.add(settings, 'overlappingRooms', 0, 10).step(1);

        let f3 = this.gui.addFolder("Corridors phase settings");
        f3.add(settings, 'branchingness', 0, 100).step(25);

        let f4 = this.gui.addFolder("Doors phase settings");
        f4.add(settings, 'extraDoorsChance', 0, 0.95).step(0.05);

        let f5 = this.gui.addFolder("Dead-ends phase settings");
        f5.add(settings, 'removalDepth', 0, 100).step(1);

        let f6 = this.gui.addFolder("Run");
        f6.add(this, 'Generate');
        f6.add(this, 'RandomizeSeed');
        f6.open();

        controllerWidth.onFinishChange(function () {
            if (settings.width % 2 === 0)
                settings.width--;

            datGuiController.gui.updateDisplay();
        });

        controllerLength.onFinishChange(function () {
            if (settings.length % 2 === 0)
                settings.length--;

            datGuiController.gui.updateDisplay();
        });

        controllerRoomMinWidth.onFinishChange(function () {
            if (settings.roomMinWidth % 2 === 0)
                settings.roomMinWidth--;

            if (settings.roomMaxWidth < settings.roomMinWidth)
                settings.roomMaxWidth = settings.roomMinWidth;

            datGuiController.gui.updateDisplay();
        });

        controllerRoomMaxWidth.onFinishChange(function () {
            if (settings.roomMaxWidth % 2 === 0)
                settings.roomMaxWidth--;

            if (settings.roomMinWidth > settings.roomMaxWidth)
                settings.roomMinWidth = settings.roomMaxWidth;

            datGuiController.gui.updateDisplay();
        });

        controllerRoomMinLength.onFinishChange(function () {
            if (settings.roomMinLength % 2 === 0)
                settings.roomMinLength--;

            if (settings.roomMaxLength < settings.roomMinLength)
                settings.roomMaxLength = settings.roomMinLength;

            datGuiController.gui.updateDisplay();
        });

        controllerRoomMaxLength.onFinishChange(function () {
            if (settings.roomMaxLength % 2 === 0)
                settings.roomMaxLength--;

            if (settings.roomMinLength > settings.roomMaxLength)
                settings.roomMinLength = settings.roomMaxLength;

            datGuiController.gui.updateDisplay();
        });

        // TODO: Remove this:
        f2.open();
        f3.open();
        f4.open();
        f5.open();
    },

    Generate: function() {
        dungeonGenerator.createDungeon();
    },

    RandomizeSeed: function() {
        dungeonGenerator.generateRandomSeed();
        this.gui.updateDisplay();
        dungeonGenerator.createDungeon();
    },

    toggleHide: function() {
        dat.GUI.toggleHide();
    }
};