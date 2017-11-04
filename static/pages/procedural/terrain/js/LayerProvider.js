/* globals Settings, NoiseGenerator */
/* exported LayerProvider */
"use strict";

let LayerProvider = {

    /** FUNCTION: generateHeightLayer(int, int)
     * Generates a new height layer.
     */
    generateHeightLayer: function(chunkCoordX, chunkCoordZ) {
        NoiseGenerator.setSeed(Settings.seed * 1);

        // First we generate the "rough" terrain:

        let height1 = NoiseGenerator.generateHeightMap({
            size:    Settings.chunkSize,
            offsetX: Settings.chunkSize * chunkCoordX,
            offsetZ: Settings.chunkSize * chunkCoordZ,
            freq:    Settings.height.freq,
            octaves: Settings.height.octavesForRough,
        });

        // Gets its low lands even lower:

        for (let i = 0; i < Settings.chunkSize; i++) {
            for (let k = 0; k < Settings.chunkSize; k++) {
                height1[k][i] = Math.pow(height1[k][i], Settings.height.redistribution);
            }
        }

        // Then we generate the "smooth" terrain:

        let height2 = NoiseGenerator.generateHeightMap({
            size:    Settings.chunkSize,
            offsetX: Settings.chunkSize * chunkCoordX,
            offsetZ: Settings.chunkSize * chunkCoordZ,
            freq:    Settings.height.freq,
            octaves: Settings.height.octavesForSmooth,
        });

        // Gets its low lands even lower:

        for (let i = 0; i < Settings.chunkSize; i++) {
            for (let k = 0; k < Settings.chunkSize; k++) {
                height2[k][i] = Math.pow(height2[k][i], Settings.height.redistribution);
            }
        }

        // And last, we combine both terrains, to get a mix between smooth and rough:

        let finalHeight = [];

        for (let k = 0; k < Settings.chunkSize; k++) {
            finalHeight.push([]);

            for (let i = 0; i < Settings.chunkSize; i++) {
                if (height1[k][i] > 0.14)
                    finalHeight[k].push(height1[k][i]);
                else if (height1[k][i] < Settings.seaLevel + 0.02)
                    finalHeight[k].push(height1[k][i]);
                else
                    finalHeight[k].push(height2[k][i]);
            }
        }

        return finalHeight;
    },

    /** FUNCTION: generateTemperatureLayer(int, int)
     * Generates a new temperature layer.
     */
    generateTemperatureLayer: function(chunkCoordX, chunkCoordZ) {
        NoiseGenerator.setSeed(Settings.seed * 2);

        let temperature = NoiseGenerator.generateHeightMap({
            size:    Settings.chunkSize,
            offsetX: Settings.chunkSize * chunkCoordX,
            offsetZ: Settings.chunkSize * chunkCoordZ,
            freq:    Settings.temperature.freq,
            octaves: Settings.temperature.octaves
        });

        return temperature;
    },

    /** FUNCTION: generateMoistureLayer(int, int)
     * Generates a new moisture layer.
     */
    generateMoistureLayer: function(chunkCoordX, chunkCoordZ) {
        NoiseGenerator.setSeed(Settings.seed * 3);

        let moisture = NoiseGenerator.generateHeightMap({
            size:    Settings.chunkSize,
            offsetX: Settings.chunkSize * chunkCoordX,
            offsetZ: Settings.chunkSize * chunkCoordZ,
            freq:    Settings.moisture.freq,
            octaves: Settings.moisture.octaves
        });

        return moisture;
    },

    /** FUNCTION: generateBiomeLayer(int, int, array, array, array)
     * Generates a new biomes layer.
     */
    generateBiomeLayer: function(chunkCoordX, chunkCoordZ, height, temperature, moisture) {

        let biomes = [];

        for (let i = 0; i < Settings.chunkSize; i++)
            biomes.push([]);

        for (let i = 0; i < Settings.chunkSize; i++) {
            for (let k = 0; k < Settings.chunkSize; k++) {
                if (height[k][i] <= Settings.seaLevel) {
                    biomes[k][i] = "wtr";
                }
                else {
                    // Gets the "level" in which the temperature falls:
                    let tempLvl = 0;
                    while (temperature[k][i] > (tempLvl+1) / Settings.biomes.length)
                        tempLvl++;

                    // Gets the range in which the moisture falls:
                    let moisLvl = 0;
                    while (moisture[k][i] > (moisLvl+1) / Settings.biomes[0].length)
                        moisLvl++;

                    // Extracts the appropiate biome from the 2D array in Settings and sets it:
                    let row = Settings.biomes.length - 1 - tempLvl;
                    let col = moisLvl;
                    biomes[k][i] = Settings.biomes[row][col];
                }
            }
        }

        return biomes;
    }
};