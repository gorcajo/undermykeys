/* exported TEMP_SCALE */
"use strict";

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function(min, max) {
    if (this < min)
        return min;
    else if (this > max)
        return max;
    else
        return this;
};

/**
 * Color scale for temperature representation.
 */
let TEMP_SCALE = [
    { r: 0,    g: 53,   b: 255 },
    { r: 0,    g: 56,   b: 255 },
    { r: 0,    g: 58,   b: 255 },
    { r: 0,    g: 61,   b: 255 },
    { r: 0,    g: 63,   b: 255 },
    { r: 0,    g: 65,   b: 255 },
    { r: 0,    g: 68,   b: 255 },
    { r: 0,    g: 71,   b: 255 },
    { r: 0,    g: 73,   b: 255 },
    { r: 0,    g: 75,   b: 255 },
    { r: 0,    g: 78,   b: 255 },
    { r: 0,    g: 80,   b: 255 },
    { r: 0,    g: 83,   b: 255 },
    { r: 0,    g: 85,   b: 255 },
    { r: 0,    g: 88,   b: 255 },
    { r: 0,    g: 91,   b: 255 },
    { r: 0,    g: 93,   b: 255 },
    { r: 0,    g: 95,   b: 255 },
    { r: 0,    g: 98,   b: 255 },
    { r: 0,    g: 100,  b: 255 },
    { r: 0,    g: 103,  b: 255 },
    { r: 0,    g: 105,  b: 255 },
    { r: 0,    g: 108,  b: 255 },
    { r: 0,    g: 110,  b: 255 },
    { r: 0,    g: 113,  b: 255 },
    { r: 0,    g: 115,  b: 255 },
    { r: 0,    g: 118,  b: 255 },
    { r: 0,    g: 120,  b: 255 },
    { r: 0,    g: 123,  b: 255 },
    { r: 0,    g: 125,  b: 255 },
    { r: 0,    g: 128,  b: 255 },
    { r: 0,    g: 130,  b: 255 },
    { r: 0,    g: 133,  b: 255 },
    { r: 0,    g: 135,  b: 255 },
    { r: 0,    g: 138,  b: 255 },
    { r: 0,    g: 140,  b: 255 },
    { r: 0,    g: 142,  b: 255 },
    { r: 0,    g: 145,  b: 255 },
    { r: 0,    g: 148,  b: 255 },
    { r: 0,    g: 150,  b: 255 },
    { r: 0,    g: 153,  b: 255 },
    { r: 0,    g: 155,  b: 255 },
    { r: 0,    g: 158,  b: 255 },
    { r: 0,    g: 160,  b: 255 },
    { r: 0,    g: 162,  b: 255 },
    { r: 0,    g: 165,  b: 255 },
    { r: 0,    g: 168,  b: 255 },
    { r: 0,    g: 170,  b: 255 },
    { r: 0,    g: 172,  b: 255 },
    { r: 0,    g: 175,  b: 255 },
    { r: 0,    g: 177,  b: 255 },
    { r: 0,    g: 180,  b: 255 },
    { r: 0,    g: 182,  b: 255 },
    { r: 0,    g: 185,  b: 255 },
    { r: 0,    g: 188,  b: 255 },
    { r: 0,    g: 190,  b: 255 },
    { r: 0,    g: 192,  b: 255 },
    { r: 0,    g: 195,  b: 255 },
    { r: 0,    g: 197,  b: 255 },
    { r: 0,    g: 200,  b: 255 },
    { r: 0,    g: 202,  b: 255 },
    { r: 1,    g: 204,  b: 255 },
    { r: 5,    g: 205,  b: 255 },
    { r: 9,    g: 205,  b: 255 },
    { r: 13,   g: 206,  b: 255 },
    { r: 17,   g: 207,  b: 255 },
    { r: 21,   g: 208,  b: 255 },
    { r: 25,   g: 209,  b: 255 },
    { r: 29,   g: 210,  b: 255 },
    { r: 33,   g: 210,  b: 255 },
    { r: 37,   g: 211,  b: 255 },
    { r: 41,   g: 212,  b: 255 },
    { r: 45,   g: 213,  b: 255 },
    { r: 49,   g: 214,  b: 255 },
    { r: 53,   g: 214,  b: 255 },
    { r: 57,   g: 215,  b: 255 },
    { r: 61,   g: 216,  b: 255 },
    { r: 64,   g: 217,  b: 255 },
    { r: 69,   g: 217,  b: 255 },
    { r: 73,   g: 218,  b: 255 },
    { r: 77,   g: 219,  b: 255 },
    { r: 80,   g: 220,  b: 255 },
    { r: 84,   g: 221,  b: 255 },
    { r: 88,   g: 221,  b: 255 },
    { r: 92,   g: 222,  b: 255 },
    { r: 96,   g: 223,  b: 255 },
    { r: 100,  g: 224,  b: 255 },
    { r: 104,  g: 224,  b: 255 },
    { r: 108,  g: 226,  b: 255 },
    { r: 112,  g: 226,  b: 255 },
    { r: 116,  g: 227,  b: 255 },
    { r: 120,  g: 228,  b: 255 },
    { r: 124,  g: 229,  b: 255 },
    { r: 128,  g: 229,  b: 255 },
    { r: 132,  g: 230,  b: 255 },
    { r: 136,  g: 231,  b: 255 },
    { r: 140,  g: 232,  b: 255 },
    { r: 144,  g: 233,  b: 255 },
    { r: 148,  g: 233,  b: 255 },
    { r: 152,  g: 234,  b: 255 },
    { r: 156,  g: 235,  b: 255 },
    { r: 160,  g: 236,  b: 255 },
    { r: 163,  g: 236,  b: 255 },
    { r: 167,  g: 237,  b: 255 },
    { r: 172,  g: 238,  b: 255 },
    { r: 176,  g: 239,  b: 255 },
    { r: 179,  g: 240,  b: 255 },
    { r: 183,  g: 240,  b: 255 },
    { r: 187,  g: 241,  b: 255 },
    { r: 191,  g: 242,  b: 255 },
    { r: 195,  g: 243,  b: 255 },
    { r: 199,  g: 243,  b: 255 },
    { r: 203,  g: 245,  b: 255 },
    { r: 207,  g: 245,  b: 255 },
    { r: 211,  g: 246,  b: 255 },
    { r: 215,  g: 247,  b: 255 },
    { r: 219,  g: 248,  b: 255 },
    { r: 223,  g: 248,  b: 255 },
    { r: 227,  g: 249,  b: 255 },
    { r: 231,  g: 250,  b: 255 },
    { r: 235,  g: 251,  b: 255 },
    { r: 239,  g: 252,  b: 255 },
    { r: 243,  g: 252,  b: 255 },
    { r: 246,  g: 253,  b: 255 },
    { r: 251,  g: 254,  b: 255 },
    { r: 254,  g: 255,  b: 254 },
    { r: 255,  g: 254,  b: 250 },
    { r: 255,  g: 253,  b: 246 },
    { r: 255,  g: 252,  b: 242 },
    { r: 255,  g: 251,  b: 238 },
    { r: 255,  g: 251,  b: 234 },
    { r: 255,  g: 250,  b: 230 },
    { r: 255,  g: 249,  b: 226 },
    { r: 255,  g: 248,  b: 222 },
    { r: 255,  g: 247,  b: 218 },
    { r: 255,  g: 247,  b: 214 },
    { r: 255,  g: 246,  b: 210 },
    { r: 255,  g: 245,  b: 206 },
    { r: 255,  g: 244,  b: 202 },
    { r: 255,  g: 243,  b: 198 },
    { r: 255,  g: 242,  b: 193 },
    { r: 255,  g: 242,  b: 190 },
    { r: 255,  g: 241,  b: 186 },
    { r: 255,  g: 240,  b: 182 },
    { r: 255,  g: 239,  b: 177 },
    { r: 255,  g: 238,  b: 174 },
    { r: 255,  g: 238,  b: 169 },
    { r: 255,  g: 237,  b: 166 },
    { r: 255,  g: 236,  b: 161 },
    { r: 255,  g: 235,  b: 157 },
    { r: 255,  g: 234,  b: 153 },
    { r: 255,  g: 234,  b: 149 },
    { r: 255,  g: 233,  b: 145 },
    { r: 255,  g: 232,  b: 141 },
    { r: 255,  g: 231,  b: 137 },
    { r: 255,  g: 230,  b: 133 },
    { r: 255,  g: 229,  b: 129 },
    { r: 255,  g: 229,  b: 125 },
    { r: 255,  g: 228,  b: 121 },
    { r: 255,  g: 227,  b: 117 },
    { r: 255,  g: 226,  b: 113 },
    { r: 255,  g: 225,  b: 109 },
    { r: 255,  g: 225,  b: 105 },
    { r: 255,  g: 224,  b: 101 },
    { r: 255,  g: 223,  b: 96 },
    { r: 255,  g: 222,  b: 93 },
    { r: 255,  g: 221,  b: 88 },
    { r: 255,  g: 221,  b: 85 },
    { r: 255,  g: 220,  b: 80 },
    { r: 255,  g: 219,  b: 76 },
    { r: 255,  g: 218,  b: 72 },
    { r: 255,  g: 218,  b: 69 },
    { r: 255,  g: 216,  b: 64 },
    { r: 255,  g: 216,  b: 60 },
    { r: 255,  g: 215,  b: 56 },
    { r: 255,  g: 214,  b: 52 },
    { r: 255,  g: 213,  b: 48 },
    { r: 255,  g: 213,  b: 44 },
    { r: 255,  g: 212,  b: 40 },
    { r: 255,  g: 211,  b: 36 },
    { r: 255,  g: 210,  b: 32 },
    { r: 255,  g: 209,  b: 28 },
    { r: 255,  g: 209,  b: 24 },
    { r: 255,  g: 208,  b: 20 },
    { r: 255,  g: 207,  b: 16 },
    { r: 255,  g: 206,  b: 12 },
    { r: 255,  g: 205,  b: 8 },
    { r: 255,  g: 205,  b: 3 },
    { r: 255,  g: 203,  b: 0 },
    { r: 255,  g: 201,  b: 0 },
    { r: 255,  g: 199,  b: 0 },
    { r: 255,  g: 196,  b: 0 },
    { r: 255,  g: 194,  b: 0 },
    { r: 255,  g: 192,  b: 0 },
    { r: 255,  g: 189,  b: 0 },
    { r: 255,  g: 187,  b: 0 },
    { r: 255,  g: 184,  b: 0 },
    { r: 255,  g: 182,  b: 0 },
    { r: 255,  g: 180,  b: 0 },
    { r: 255,  g: 177,  b: 0 },
    { r: 255,  g: 175,  b: 0 },
    { r: 255,  g: 173,  b: 0 },
    { r: 255,  g: 170,  b: 0 },
    { r: 255,  g: 168,  b: 0 },
    { r: 255,  g: 166,  b: 0 },
    { r: 255,  g: 163,  b: 0 },
    { r: 255,  g: 161,  b: 0 },
    { r: 255,  g: 158,  b: 0 },
    { r: 255,  g: 156,  b: 0 },
    { r: 255,  g: 154,  b: 0 },
    { r: 255,  g: 151,  b: 0 },
    { r: 255,  g: 149,  b: 0 },
    { r: 255,  g: 146,  b: 0 },
    { r: 255,  g: 144,  b: 0 },
    { r: 255,  g: 142,  b: 0 },
    { r: 255,  g: 139,  b: 0 },
    { r: 255,  g: 137,  b: 0 },
    { r: 255,  g: 135,  b: 0 },
    { r: 255,  g: 132,  b: 0 },
    { r: 255,  g: 130,  b: 0 },
    { r: 255,  g: 127,  b: 0 },
    { r: 255,  g: 125,  b: 0 },
    { r: 255,  g: 123,  b: 0 },
    { r: 255,  g: 121,  b: 0 },
    { r: 255,  g: 118,  b: 0 },
    { r: 255,  g: 116,  b: 0 },
    { r: 255,  g: 113,  b: 0 },
    { r: 255,  g: 111,  b: 0 },
    { r: 255,  g: 109,  b: 0 },
    { r: 255,  g: 106,  b: 0 },
    { r: 255,  g: 104,  b: 0 },
    { r: 255,  g: 101,  b: 0 },
    { r: 255,  g: 99,   b: 0 },
    { r: 255,  g: 97,   b: 0 },
    { r: 255,  g: 94,   b: 0 },
    { r: 255,  g: 92,   b: 0 },
    { r: 255,  g: 90,   b: 0 },
    { r: 255,  g: 87,   b: 0 },
    { r: 255,  g: 84,   b: 0 },
    { r: 255,  g: 82,   b: 0 },
    { r: 255,  g: 80,   b: 0 },
    { r: 255,  g: 78,   b: 0 },
    { r: 255,  g: 75,   b: 0 },
    { r: 255,  g: 73,   b: 0 },
    { r: 255,  g: 70,   b: 0 },
    { r: 255,  g: 68,   b: 0 },
    { r: 255,  g: 66,   b: 0 },
    { r: 255,  g: 63,   b: 0 },
    { r: 255,  g: 61,   b: 0 },
    { r: 255,  g: 59,   b: 0 },
    { r: 255,  g: 56,   b: 0 },
    { r: 255,  g: 54,   b: 0 },
    { r: 255,  g: 52,   b: 0 },
    { r: 255,  g: 51,   b: 0 },
    { r: 255,  g: 51,   b: 0 },
    { r: 255,  g: 51,   b: 0 }
];