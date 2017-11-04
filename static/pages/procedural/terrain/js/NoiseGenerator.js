/* globals noise */
/* exported NoiseGenerator */
"use strict";

let NoiseGenerator = {

    /** FUNCTION: generateHeightMap(offset)
     * Generates a height map in the range of [0.0, 1.0]
     *  settings: (object) contains the settings for this generation:
     *      {
     *          size:    int,    // size in pixels
     *          offsetX: int,    // chunk X coordinate in pixels
     *          offsetZ: int,    // chunk Z coordinate in pixels
     *          freq:    float,  // noise frequency (or zoom)
     *          octaves: int[]   // noise octaves to sum
     *      };
     */
    generateHeightMap: function(settings) {
        let heightmap = [];

        for (let i = 0; i < settings.size; i++)
            heightmap.push([]);

        for (let i = 0; i < settings.size; i++) {
            for (let k = 0; k < settings.size; k++) {

                heightmap[k][i] = 0;

                // Calculates the coordinates of the noise value for this loop iteration:
                let x = (i + settings.offsetX) / settings.size;
                let z = (k + settings.offsetZ) / settings.size;

                // Applies the fundamental frequency:
                x *= settings.freq;
                z *= settings.freq;

                // Gets the noise value for the current point with all the octaves:
                for (let n = 0; n < settings.octaves.length; n++) {
                    // The current octave must be in powers of two, so:
                    let currentOctave = Math.pow(2, settings.octaves[n]);

                    // Gets a noise value for the current point and octave:
                    let noiseValue = noise.simplex2(currentOctave * x, currentOctave * z);

                    // That noise value is in [-1.0, +1.0] range,
                    // so we transform it into [0.0, +1.0] range:
                    noiseValue = (noiseValue + 1) / 2;

                    // Finnally, we add the noise value for this octave to the
                    // current point 'total noise':
                    heightmap[k][i] += (1 / currentOctave) * noiseValue;
                }
                
                // The noise value in the current points comes in a range
                // that is not in the range [0.0, +1.0], so:

                let dividend = 0;

                for (let n = 0; n < settings.octaves.length; n++) {
                    let currentOctave = Math.pow(2, settings.octaves[n]);
                    dividend += 1 / currentOctave;
                }

                heightmap[k][i] = heightmap[k][i] / dividend;
            }   
        }

        return heightmap;
    },

    /** FUNCTION: setSeed(seed)
     * Sets the seed passed in the parameter or generates a new one..
     */
    setSeed: function(seed) {
        noise.seed(seed);
    }
};