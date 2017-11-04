/* globals WorldGenerator, Settings, dat, PhaserController */
/* exported DatGuiController */
"use strict";

let DatGuiController = {

    gui: {},
    folders: [],

    init: function() {
        this.gui = new dat.GUI();

        let customContainer = document.getElementById('datgui-container');
        customContainer.appendChild(this.gui.domElement);

        let f1 = this.gui.addFolder("General settings");
        f1.add(Settings, 'worldRadius', 1, 8).step(1);
        let controllerRadialSight = f1.add(Settings, 'radialSight');
        f1.add(Settings, 'chunkSize', 1, 100).step(1);
        f1.open();
        this.folders.push(f1);

        let f2 = this.gui.addFolder("Generation settings");
        f2.add(Settings, 'seed', 0, 65535).step(1);
        f2.add(Settings, 'seaLevel', 0.0, 0.2);
        f2.open();
        this.folders.push(f2);

        let f3 = this.gui.addFolder("Visualization");
        f3.add(this, 'Biomes');
        f3.add(this, 'Height');
        f3.add(this, 'Temperature');
        f3.add(this, 'Moisture');
        let controllerGridVisible = f3.add(Settings, 'gridVisible');
        f3.open();
        this.folders.push(f3);

        let f4 = this.gui.addFolder("Run");
        f4.add(this, 'Generate');
        f4.add(this, 'RandomizeSeed');
        f4.open();
        this.folders.push(f4);

        controllerRadialSight.onFinishChange(function() {
            WorldGenerator.createWorld();
        });

        controllerGridVisible.onFinishChange(function(value) {
            PhaserController.setGridVisibility(value);
        });
    },

    Biomes: function() {
        PhaserController.changeToLayer(1);
    },

    Height: function() {
        PhaserController.changeToLayer(2);
    },

    Temperature: function() {
        PhaserController.changeToLayer(3);
    },

    Moisture: function() {
        PhaserController.changeToLayer(4);
    },

    Generate: function() {
        WorldGenerator.createWorld();
        PhaserController.refreshGrid();
    },

    RandomizeSeed: function() {
        WorldGenerator.generateRandomSeed();
        this.folders[1].__controllers[0].updateDisplay();
        WorldGenerator.createWorld();
        PhaserController.refreshGrid();
    },

    toggleHide: function() {
        dat.GUI.toggleHide();
    }
};
