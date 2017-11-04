/* exported utils */
"use strict";

Number.prototype.clamp = function(min, max) {
    if (this < min)
        return min;
    else if (this > max)
        return max;
    else
        return this;
};

let utils = {
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    getRandomOddInt: function(min, max) {
        let randomInt = 0;

        while (randomInt % 2 === 0) {
            randomInt = this.getRandomInt(min, max);
        }

        return randomInt;
    },

    shuffleArray: function(array) {
        let currentIndex = array.length;
        let temporaryValue;
        let randomIndex;

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
};