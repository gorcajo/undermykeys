/* globals  Tile, constants, utils */
/* exported Level */
"use strict";

// Based in http://journal.stuffwithstuff.com/2014/12/21/rooms-and-mazes/

class Level {
    constructor(width, length) {
        this.tiles = [];
        this.width = width;
        this.length = length;

        for (let k = 0; k < length; k++) {
            this.tiles[k] = [];

            for (let i = 0; i < width; i++) {
                this.tiles[k][i] = new Tile(constants.tileTypes.wall, "", false);
            }
        }
    }

    placeRooms(placeAttempts, overlappingRooms, roomMinWidth, roomMinLength, roomMaxWidth, roomMaxLength) {
        for (let n = 0; n < placeAttempts; n++) {

            // Generates a random room:

            let room = {};

            if (Math.random() <= 1.0) {
                room = {
                    x: utils.getRandomOddInt(1, this.width),
                    z: utils.getRandomOddInt(1, this.length),
                    w: utils.getRandomOddInt(roomMinWidth, roomMaxWidth),
                    h: utils.getRandomOddInt(roomMinLength, roomMaxLength)
                };
            }

            // Skips this room placement attempt if this room collides with the map bottom border:

            if (room.z + room.h >= this.length)
                continue;

            // Skips this room placement attempt if this room collides with the map right border:

            if (room.x + room.w >= this.width)
                continue;

            // Skips this room placement attempt if this room collides with another room:

            let collision = false;

            for (let k = room.z; k <= room.z + room.h; k++)
                for (let i = room.x; i <= room.x + room.w; i++)
                    if (this.tiles[k][i].type === constants.tileTypes.room)
                        collision = true;

            if (collision)
                continue;

            // Places the room (if there was no collisions previously):

            for (let k = 0; k < room.h; k++) {
                for (let i = 0; i < room.w; i++) {
                    this.tiles[room.z + k][room.x + i].type = constants.tileTypes.room;
                    this.tiles[room.z + k][room.x + i].areaID = "room" + n;
                }
            }
        }

        let n = overlappingRooms;

        while (n > 0) {

            // Generates a random room:

            let room = {};

            if (Math.random() <= 1.0) {
                room = {
                    x: utils.getRandomOddInt(1, this.width),
                    z: utils.getRandomOddInt(1, this.length),
                    w: utils.getRandomOddInt(roomMinWidth, roomMaxWidth),
                    h: utils.getRandomOddInt(roomMinLength, roomMaxLength)
                };
            }

            // Skips this room placement attempt if this room collides with the map bottom border:

            if (room.z + room.h >= this.length)
                continue;

            // Skips this room placement attempt if this room collides with the map right border:

            if (room.x + room.w >= this.width)
                continue;

            // Places the room:

            for (let k = 0; k < room.h; k++) {
                for (let i = 0; i < room.w; i++) {
                    this.tiles[room.z + k][room.x + i].type = constants.tileTypes.room;
                    this.tiles[room.z + k][room.x + i].areaID = "room" + n;
                }
            }

            n--;
        }
    }

    generateAllCorridors(branchingness) {
        this.branchingness = branchingness;

        let corridorID = 0;

        for (let i = 1; i < this.width; i += 2) {
            for (let k = 1; k < this.length; k += 2) {
                if (this.tiles[k][i].type === constants.tileTypes.wall) {
                    this.generateCorridor(i, k, corridorID);
                    corridorID++;
                }
            }
        }
    }

    // The Growing Tree algorithm!
    // http://weblog.jamisbuck.org/2011/1/27/maze-generation-growing-tree-algorithm
    
    generateCorridor(initialX, initialZ, corridorID) {

        // Initializations:

        let tiles = [];
        tiles.push([initialX, initialZ]);

        while (tiles.length > 0) {

            // The Growing Tree algorithm starts as follows:

            let index = -1;

            if (this.branchingness <= utils.getRandomInt(0, 99))
                index = tiles.length - 1;
            else
                index = utils.getRandomInt(0, tiles.length - 1);

            let x = tiles[index][0];
            let z = tiles[index][1];

            let directions = [
                constants.directions.north,
                constants.directions.south,
                constants.directions.east,
                constants.directions.west
            ];

            directions = utils.shuffleArray(directions);

            for (let i = 0; i < directions.length; i++) {

                // The element directions[i] points to a direction of a new corridor extension, and the
                // next corridor extension is formed by two tiles; so firstly, we translate the direction
                // into an position increment (a.k.a. a position delta):

                let deltaPosition = {
                    x: 0,
                    z: 0
                };

                if (directions[i] === constants.directions.north)
                    deltaPosition.z = -1;
                else if (directions[i] === constants.directions.east)
                    deltaPosition.x = 1;
                else if (directions[i] === constants.directions.south)
                    deltaPosition.z = 1;
                else if (directions[i] === constants.directions.west)
                    deltaPosition.x = -1;

                // With that position delta, we get our two tile coordinates:

                let mx = x + deltaPosition.x * 2;
                let mz = z + deltaPosition.z * 2;
                let nx = x + deltaPosition.x;
                let nz = z + deltaPosition.z;

                // If the furthest of those tiles are within map boundaries...

                if ((mx >= 0) && (mz >= 0) && (mx < this.width) && (mz < this.length)) {

                    // ... and if that tile is a wall...

                    if (this.tiles[mz][mx].type === constants.tileTypes.wall) {

                        // ... then places the corridor...

                        this.tiles[nz][nx].type = constants.tileTypes.corridor;
                        this.tiles[nz][nx].areaID = "corridor" + corridorID;

                        this.tiles[mz][mx].type = constants.tileTypes.corridor;
                        this.tiles[mz][mx].areaID = "corridor" + corridorID;

                        // ... and continues with the Growing Tree Algorithm:

                        tiles.push([mx, mz]);
                        index = -1;
                        break;
                    }
                }
            }

            if (index > -1)
                tiles.splice(index, 1);
        }
    }

    openDoors(extraDoorsChance) {

        // First, we look for door candidate tiles, which are all of those with a room in opposite sides,
        // or with a room and a corridor in opposite sides:

        let doorCandidates = []; // doorCandidates[n][0] will be X coordinate and doorCandidates[n][1] will be Z

        for (let k = 1; k < this.length - 1; k++) {
            for (let i = 1; i < this.width - 1; i++) {
                if (this.tiles[k][i].type === constants.tileTypes.wall) {

                    if ((this.tiles[k][i-1].type === constants.tileTypes.room) &&
                        (this.tiles[k][i+1].type === constants.tileTypes.room))
                        doorCandidates.push([i, k]);
                    else if ((this.tiles[k][i-1].type === constants.tileTypes.room) &&
                        (this.tiles[k][i+1].type === constants.tileTypes.corridor))
                        doorCandidates.push([i, k]);
                    else if ((this.tiles[k][i-1].type === constants.tileTypes.corridor) &&
                        (this.tiles[k][i+1].type === constants.tileTypes.room))
                        doorCandidates.push([i, k]);
                    else if ((this.tiles[k-1][i].type === constants.tileTypes.room) &&
                        (this.tiles[k+1][i].type === constants.tileTypes.room))
                        doorCandidates.push([i, k]);
                    else if ((this.tiles[k-1][i].type === constants.tileTypes.room) &&
                        (this.tiles[k+1][i].type === constants.tileTypes.corridor))
                        doorCandidates.push([i, k]);
                    else if ((this.tiles[k-1][i].type === constants.tileTypes.corridor) &&
                        (this.tiles[k+1][i].type === constants.tileTypes.room))
                        doorCandidates.push([i, k]);
                }
            }
        }

        // Second, we choose a random room to be the main region, and we mark it as "connected":

        let rndX = utils.getRandomOddInt(1, this.width - 1);
        let rndZ = utils.getRandomOddInt(1, this.length - 1);

        while (true) {
            if ((this.tiles[rndZ][rndX].type === constants.tileTypes.room) && !this.tiles[rndZ][rndX].isConnected) {
                this.makeAreaConnected(this.tiles[rndZ][rndX].areaID);
                break;
            }
            else {
                rndX = utils.getRandomOddInt(1, this.width - 1);
                rndZ = utils.getRandomOddInt(1, this.length - 1);
            }
        }

        // Third, we'll be looking for random door candidates that touches a "connected" tile,
        // connecting the areas between those candidates and placing a room in their places:

        while (doorCandidates.length > 0) {
            let rndIndex = utils.getRandomInt(0, doorCandidates.length - 1);
            let x = doorCandidates[rndIndex][0];
            let z = doorCandidates[rndIndex][1];

            // A simple flag:

            let doorPlaced = false;

            // If we find a door candidate that touches a "connected" tile,
            // we "connect" the opposite tile's area and we place a door:

            if (this.tiles[z][x - 1].isConnected &&
                (this.tiles[z - 1][x].type === constants.tileTypes.wall) &&
                (this.tiles[z + 1][x].type === constants.tileTypes.wall)) {

                this.makeAreaConnected(this.tiles[z][x + 1].areaID);
                this.tiles[z][x].type = constants.tileTypes.verticalDoor;
                doorPlaced = true;
            }
            else if (this.tiles[z][x + 1].isConnected &&
                (this.tiles[z - 1][x].type === constants.tileTypes.wall) &&
                (this.tiles[z + 1][x].type === constants.tileTypes.wall)) {

                this.makeAreaConnected(this.tiles[z][x - 1].areaID);
                this.tiles[z][x].type = constants.tileTypes.verticalDoor;
                doorPlaced = true;
            }
            else if (this.tiles[z - 1][x].isConnected &&
                (this.tiles[z][x - 1].type === constants.tileTypes.wall) &&
                (this.tiles[z][x + 1].type === constants.tileTypes.wall)) {

                this.makeAreaConnected(this.tiles[z + 1][x].areaID);
                this.tiles[z][x].type = constants.tileTypes.horizontalDoor;
                doorPlaced = true;
            }
            else if (this.tiles[z + 1][x].isConnected &&
                (this.tiles[z][x - 1].type === constants.tileTypes.wall) &&
                (this.tiles[z][x + 1].type === constants.tileTypes.wall)) {

                this.makeAreaConnected(this.tiles[z - 1][x].areaID);
                this.tiles[z][x].type = constants.tileTypes.horizontalDoor;
                doorPlaced = true;
            }

            // Then, if we have placed a door, we must remove all
            // the candidates between regions already connected...
            // except in the case we have to add an extra door:

            if (doorPlaced && (Math.random() > extraDoorsChance)) {
                for (let n = doorCandidates.length - 1; n >= 0; n--) {
                    let x = doorCandidates[n][0];
                    let z = doorCandidates[n][1];

                    if (this.tiles[z][x - 1].isConnected && this.tiles[z][x + 1].isConnected)
                        doorCandidates.splice(n, 1);
                    else if (this.tiles[z - 1][x].isConnected && this.tiles[z + 1][x].isConnected)
                        doorCandidates.splice(n, 1);
                }
            }
        }
    }

    makeAreaConnected(areaID) {
        for (let k = 0; k < this.length; k++)
            for (let i = 0; i < this.width; i++)
                if (this.tiles[k][i].areaID === areaID)
                    this.tiles[k][i].isConnected = true;
    }

    removeDeadEnds(removalDepth) {

        // We are going to do some sweeps (as many as removalDepth's value) to remove dead-ends:

        for (let n = 0; n < removalDepth; n++) {

            let deadEndsMarkedForRemove = [];

            for (let k = 0; k < this.length; k++) {
                deadEndsMarkedForRemove[k] = [];

                for (let i = 0; i < this.width; i++)
                    deadEndsMarkedForRemove[k][i] = false;
            }

            // A dead-end is every corridor tile that has only one corridor or door tile adjacent:

            for (let k = 1; k < this.length - 1; k++) {
                for (let i = 1; i < this.width - 1; i++) {
                    if (this.tiles[k][i].type === constants.tileTypes.corridor) {
                        let corridorTilesAdjacent = 0;

                        if ((this.tiles[k][i + 1].type === constants.tileTypes.corridor) ||
                            (this.tiles[k][i + 1].type === constants.tileTypes.verticalDoor) ||
                            (this.tiles[k][i + 1].type === constants.tileTypes.horizontalDoor))
                            corridorTilesAdjacent++;
                        if ((this.tiles[k][i - 1].type === constants.tileTypes.corridor) ||
                            (this.tiles[k][i - 1].type === constants.tileTypes.verticalDoor) ||
                            (this.tiles[k][i - 1].type === constants.tileTypes.horizontalDoor))
                            corridorTilesAdjacent++;
                        if ((this.tiles[k - 1][i].type === constants.tileTypes.corridor) ||
                            (this.tiles[k - 1][i].type === constants.tileTypes.verticalDoor) ||
                            (this.tiles[k - 1][i].type === constants.tileTypes.horizontalDoor))
                            corridorTilesAdjacent++;
                        if ((this.tiles[k + 1][i].type === constants.tileTypes.corridor) ||
                            (this.tiles[k + 1][i].type === constants.tileTypes.verticalDoor) ||
                            (this.tiles[k + 1][i].type === constants.tileTypes.horizontalDoor))
                            corridorTilesAdjacent++;

                        if (corridorTilesAdjacent === 1)
                            deadEndsMarkedForRemove[k][i] = true;
                    }
                }
            }

            for (let k = 1; k < this.length - 1; k++)
                for (let i = 1; i < this.width - 1; i++)
                    if (deadEndsMarkedForRemove[k][i] === true)
                        this.tiles[k][i].type = constants.tileTypes.wall;
        }

        // Finally, we remove all "doors to nowhere", if any:

        for (let k = 1; k < this.length - 1; k++) {
            for (let i = 1; i < this.width - 1; i++) {
                if (this.tiles[k][i].type === constants.tileTypes.verticalDoor) {
                    if ((this.tiles[k][i - 1].type === constants.tileTypes.wall) ||
                        (this.tiles[k][i + 1].type === constants.tileTypes.wall))
                        this.tiles[k][i].type = constants.tileTypes.wall;
                }
                else if (this.tiles[k][i].type === constants.tileTypes.horizontalDoor) {
                    if ((this.tiles[k - 1][i].type === constants.tileTypes.wall) ||
                        (this.tiles[k + 1][i].type === constants.tileTypes.wall))
                        this.tiles[k][i].type = constants.tileTypes.wall;
                }
            }
        }
    }

    removeArea(areaID) {
        for (let k = 0; k < this.length; k++)
            for (let i = 0; i < this.width; i++)
                if (this.tiles[k][i].areaID === areaID)
                    this.tiles[k][i].type = constants.tileTypes.wall;
    }
}