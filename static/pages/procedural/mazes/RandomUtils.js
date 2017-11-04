/* exported dice, coin, shuffleArray, randomSeed */
"use strict";

/**
 * Throws a dice (returns an integer between 'min'' and 'max', both inclusve)
 */
function dice(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Flips a coin (returns true or false)
 */
function coin() {
    return dice(1, 2) === 1;
}

/**
 * Shuffles an array
 */
function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function randomSeed() {
    var base58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

    var seed = "";

    for (var i = 0; i < 10; i++)
        seed += base58.charAt(Math.floor(Math.random() * base58.length));

    return seed;
}
