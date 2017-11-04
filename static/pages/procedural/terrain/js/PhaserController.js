/* globals Phaser, Settings, TEMP_SCALE, DatGuiController, WorldGenerator */
/* exported PhaserController */
"use strict";

let PhaserController = {

    game: null,

    keyPressedLastFrame: false,
    showBiomesKey: {},
    showHeightKey: {},
    showTemperatureKey: {},
    showMoistureKey: {},

    tooltipGroup: {},
    gridGroup: {},
    biomeGroup: {},
    heightGroup: {},
    temperatureGroup: {},
    moistureGroup: {},

    currentLayer: 2,

    /** FUNCTION: init()
     * Initializer.
     */
    init: function() {
        this.game = new Phaser.Game(
            0,
            0,
            Phaser.AUTO,
            "canvas-container",
            {
                preload: this.preload,
                create:  this.create,
                update:  this.update,
                render:  this.render
            },
            true
        );
    },

    /** FUNCTION: drawChunk(object, int, int)
     * Draws a sprite containing the chunk into the canvas.
     *  layers:      all the heightmaps of the layers
     *  chunkCoordX: chunk's X coordinate
     *  chunkCoordZ: chunk's Z coordinate
     */
    drawChunk: function(chunk, chunkCoordX, chunkCoordZ) {

        // Creates this chunk as several bitmapData, one for each layer:
        let size = Settings.chunkSize;

        let heightBitmapData = this.game.add.bitmapData(size, size);
        let temperatureBitmapData = this.game.add.bitmapData(size, size);
        let moistureBitmapData = this.game.add.bitmapData(size, size);
        let biomeBitmapData = this.game.add.bitmapData(size, size);

        // Sets the layers into the bitmapData:

        for (let i = 0; i < size; i++) {
            for (let k = 0; k < size; k++) {
                // Height map, both over and under the sea:

                let land = chunk.height[k][i];
                let colour = Math.floor(land * 255);

                if (land <= Settings.seaLevel) {
                    colour = colour * 6 + 150;
                    colour = colour.clamp(0, 255);
                    heightBitmapData.setPixel(i, k, 100, 100, colour, false);
                }
                else {
                    colour = colour + 100;
                    colour = colour.clamp(0, 200);
                    heightBitmapData.setPixel(i, k, 0, colour, 0, false);
                }

                // Temperature:

                let temperature = chunk.temperature[k][i];
                temperature = Math.floor(temperature * 255);
                temperature = temperature.clamp(0, 255);
                let r = TEMP_SCALE[temperature].r;
                let g = TEMP_SCALE[temperature].g;
                let b = TEMP_SCALE[temperature].b;
                temperatureBitmapData.setPixel(i, k, r, g, b, false);

                // Moisture:

                let moisture = chunk.moisture[k][i];
                moisture = Math.floor(moisture * 255) - 50;
                moisture = moisture.clamp(0, 255);
                moistureBitmapData.setPixel(i, k, 0, 0, moisture, false);

                // Biome:

                switch (chunk.biome[k][i]) {
                    case "wtr": // water
                        biomeBitmapData.setPixel(i, k, 63, 63, 255, false);
                    break;
                    
                    case "dst": // desert
                        biomeBitmapData.setPixel(i, k, 255, 255, 102, false);
                    break;
                    
                    case "grl": // grassland
                        biomeBitmapData.setPixel(i, k, 51, 255, 51, false);
                    break;
                    
                    case "cfr": // conifer forest
                        biomeBitmapData.setPixel(i, k, 0, 153, 76, false);
                    break;
                    
                    case "dfr": // decidious forest
                        biomeBitmapData.setPixel(i, k, 0, 153, 0, false);
                    break;
                    
                    case "jgl": // jungle
                        biomeBitmapData.setPixel(i, k, 0, 204, 0, false);
                    break;
                    
                    case "swa": // swamp
                        biomeBitmapData.setPixel(i, k, 60, 60, 0, false);
                    break;
                    
                    case "sno": // snow
                        biomeBitmapData.setPixel(i, k, 255, 255, 255, false);
                    break;

                    default:
                        biomeBitmapData.setPixel(i, k, 255, 0, 255, false);
                }
            }
        }

        // Updates the bitmapData to actually draw the pixels into it:

        heightBitmapData.ctx.putImageData(heightBitmapData.imageData, 0, 0);
        temperatureBitmapData.ctx.putImageData(temperatureBitmapData.imageData, 0, 0);
        moistureBitmapData.ctx.putImageData(moistureBitmapData.imageData, 0, 0);
        biomeBitmapData.ctx.putImageData(biomeBitmapData.imageData, 0, 0);

        // Calculates the coordinates in pixels of this chunk:

        let posX = (chunkCoordX + Settings.worldRadius) * size;
        let posZ = (chunkCoordZ + Settings.worldRadius) * size;

        // And draws a sprite with the bitmapData:

        this.biomeGroup.add(this.game.add.sprite(posX, posZ, biomeBitmapData));
        this.heightGroup.add(this.game.add.sprite(posX, posZ, heightBitmapData));
        this.temperatureGroup.add(this.game.add.sprite(posX, posZ, temperatureBitmapData));
        this.moistureGroup.add(this.game.add.sprite(posX, posZ, moistureBitmapData));
    },

    /** FUNCTION: destroySprites()
     * Removes all the chunk sprites from their groups.
     */
    destroySprites: function() {
        this.biomeGroup.removeAll(true);
        this.heightGroup.removeAll(true);
        this.temperatureGroup.removeAll(true);
        this.moistureGroup.removeAll(true);
    },

    /** FUNCTION: changeToLayer(int)
     * Hides all the layers excepts by the parameter one.
     */
    changeToLayer: function(layer) {
        this.currentLayer = layer;

        switch (layer) {
            case 1:
                this.game.world.bringToTop(this.biomeGroup);
            break;

            case 2:
                this.game.world.bringToTop(this.heightGroup);
            break;

            case 3:
                this.game.world.bringToTop(this.temperatureGroup);
            break;

            case 4:
                this.game.world.bringToTop(this.moistureGroup);
            break;

            default:
                this.game.world.bringToTop(this.heightGroup);
        }

        this.setGridVisibility(Settings.gridVisible);
    },

    /** FUNCTION: changeToCurrentLayer()
     * Refreshes the visible layer.
     */
    changeToCurrentLayer: function() {
        this.changeToLayer(this.currentLayer);
    },

    /** FUNCTION: changeToCurrentLayer(boolean)
     * Shows or hides the grid.
     */
    setGridVisibility: function(value) {
        if (value === true)
            this.game.world.bringToTop(this.gridGroup);
        else
            this.game.world.sendToBack(this.gridGroup);
    },

    refreshGrid: function() {
        this.gridGroup.removeAll(true);

        let grid = this.game.add.graphics(0, 0);
        grid.lineStyle(1, 0x202020);

        let lines = 2 * Settings.worldRadius + 2;
        let len = Settings.lineLength;

        // Vertical lines:
        for (let i = 1; i <= lines; i++) {
            for (let j = 0; j <= lines; j++) {
                grid.moveTo(i * Settings.chunkSize, j * Settings.chunkSize - len);
                grid.lineTo(i * Settings.chunkSize, j * Settings.chunkSize + len);
            }
        }

        // Horizontal lines:
        for (let i = 0; i <= lines; i++) {
            for (let j = 1; j <= lines; j++) {
                grid.moveTo(i * Settings.chunkSize - len, j * Settings.chunkSize);
                grid.lineTo(i * Settings.chunkSize + len, j * Settings.chunkSize);
            }
        }

        grid.endFill();
        this.gridGroup.add(grid);
    },

    /** FUNCTION: refreshCanvasSize()
     * Refreshes the canvas size.
     */
    refreshCanvasSize: function() {
        let canvasSize = Settings.chunkSize * (Settings.worldRadius * 2 + 1);
        PhaserController.game.scale.setGameSize(canvasSize, canvasSize);
    },

    // Phaser callback
    preload: function() {
        // ...
    },

    // Phaser callback
    create: function() {
        let pc = PhaserController;

        // Phaser groups, a.k.a. sprite layers:

        pc.biomeGroup = pc.game.add.group();
        pc.heightGroup = pc.game.add.group();
        pc.temperatureGroup = pc.game.add.group();
        pc.moistureGroup = pc.game.add.group();
        pc.gridGroup = pc.game.add.group();
        pc.tooltipGroup = pc.game.add.group();

        // Keyboard input:

        pc.showBiomesKey = pc.game.input.keyboard.addKey(Phaser.KeyCode.B);
        pc.showHeightKey = pc.game.input.keyboard.addKey(Phaser.KeyCode.H);
        pc.showTemperatureKey = pc.game.input.keyboard.addKey(Phaser.KeyCode.T);
        pc.showMoistureKey = pc.game.input.keyboard.addKey(Phaser.KeyCode.M);
        pc.refreshCanvasSize();

        // WORKAROUND, H key is used by dat.gui to hide/show the gui so we show it again:

        pc.showHeightKey.onDown.add(DatGuiController.toggleHide, this);

        // The grid:

        pc.refreshGrid();

        // Tooltip that shows what biome there is under the mouse:

        let tooltip = pc.game.add.text(0, 0, "");
        tooltip.font = "Arial Black";
        tooltip.fontSize = 14;
        tooltip.align = "left";
        tooltip.stroke = '#000000';
        tooltip.strokeThickness = 3;
        tooltip.fill = '#43d637';

        pc.tooltipGroup.add(tooltip);

        pc.game.input.addMoveCallback(function(pointer, x, y) {
            pc.game.world.bringToTop(pc.tooltipGroup);

            let chunkCoordX = Math.floor(x / Settings.chunkSize);
            let chunkCoordY = Math.floor(y / Settings.chunkSize);
            let chunk = WorldGenerator.chunks[chunkCoordY][chunkCoordX];

            let withinChunkCoordX = x - chunkCoordX * Settings.chunkSize;
            let withinChunkCoordY = y - chunkCoordY * Settings.chunkSize;

            pc.tooltipGroup.x = 10;
            pc.tooltipGroup.y = 10;

            if ((x < 160) && (y < 40)) {
                pc.tooltipGroup.y += 40;
            }

            let newText;

            if (chunk === null) { // This is for chunks out of sight in "radialSight" mode
                newText = "???";
            }
            else if (pc.currentLayer === 1) {
                let biome = chunk.biome[withinChunkCoordY][withinChunkCoordX];

                switch (biome) {
                    case "dst":
                        newText = "Desert";
                    break;

                    case "jgl":
                        newText = "Jungle";
                    break;

                    case "swa":
                        newText = "Swamp";
                    break;

                    case "grl":
                        newText = "Grassland";
                    break;

                    case "dfr":
                        newText = "Decidious Forest";
                    break;

                    case "cfr":
                        newText = "Conifer Forest";
                    break;

                    case "sno":
                        newText = "Snow";
                    break;

                    case "wtr":
                        newText = "Water";
                    break;

                    default:
                        newText = "<unknown biome>";
                }
            }
            else if (pc.currentLayer === 2) {
                newText = chunk.height[withinChunkCoordY][withinChunkCoordX];
            }
            else if (pc.currentLayer === 3) {
                newText = chunk.temperature[withinChunkCoordY][withinChunkCoordX];
            }
            else if (pc.currentLayer === 4) {
                newText = chunk.moisture[withinChunkCoordY][withinChunkCoordX];
            }
            else {
                newText = "<unknown layer>";
            }

            pc.tooltipGroup.getAt(0).text = newText;
        }, this);
    },

    // Phaser callback
    update: function() {
        let pc = PhaserController;

        if (!pc.keyPressedLastFrame) {
            if (pc.showBiomesKey.isDown) {
                pc.changeToLayer(1);
                pc.keyPressedLastFrame = true;
            }
            else if (pc.showHeightKey.isDown) {
                pc.changeToLayer(2);
                pc.keyPressedLastFrame = true;
            }
            else if (pc.showTemperatureKey.isDown) {
                pc.changeToLayer(3);
                pc.keyPressedLastFrame = true;
            }
            else if (pc.showMoistureKey.isDown) {
                pc.changeToLayer(4);
                pc.keyPressedLastFrame = true;
            }
        }
        else {
            // CARE WITH THIS DIRTY CODE, is a single if with ANDs:
            if (!pc.showBiomesKey.isDown)
            if (!pc.showHeightKey.isDown)
            if (!pc.showTemperatureKey.isDown)
            if (!pc.showMoistureKey.isDown)
                pc.keyPressedLastFrame = false;
        }
    }
};