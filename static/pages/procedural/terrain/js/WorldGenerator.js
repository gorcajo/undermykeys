/* globals LayerProvider, PhaserController, DatGuiController, Settings */
/* exported WorldGenerator */
"use strict";

let WorldGenerator = {

    chunks: [],

    /** FUNCTION: init()
     * The very first initialization.
     */
    init: function() {
        PhaserController.init();
        DatGuiController.init();
        
        window.setTimeout(function() {
            WorldGenerator.createWorld();
        }, 50);
    },

    /** FUNCTION: setSeed(int)
     * Seed setter.
     */
    setSeed: function(seed) {
        Settings.seed = seed;
    },

    /** FUNCTION: setRandomSeed()
     * Sets a random seed.
     */
    generateRandomSeed: function() {
        Settings.seed = Math.floor(Math.random() * 65535);
    },

    /** FUNCTION: generateWorld()
     * Creates all the chunks in the world.
     */
    createWorld: function() {
        this.chunks = [];
        PhaserController.destroySprites();
        PhaserController.refreshCanvasSize();

        // Creates one by one each chunk and places it into the world:

        let radius = Settings.worldRadius;

        for (let k = -radius; k <= radius; k++) {
            this.chunks.push([]);

            for (let i = -radius; i <= radius; i++) {
                if ((Settings.radialSight === false) || (i*i + k*k <= radius*radius)) {
                    let height = LayerProvider.generateHeightLayer(i, k);
                    let temperature = LayerProvider.generateTemperatureLayer(i, k);
                    let moisture = LayerProvider.generateMoistureLayer(i, k);
                    let biome = LayerProvider.generateBiomeLayer(i, k, height, temperature, moisture);

                    let chunk = {
                        height: height,
                        temperature: temperature,
                        moisture: moisture,
                        biome: biome
                    };

                    this.chunks[k + radius].push(chunk);
                    PhaserController.drawChunk(chunk, i, k);
                }
                else {
                    this.chunks[k + radius].push(null);
                }
            }
        }

        PhaserController.changeToCurrentLayer();
    }
};