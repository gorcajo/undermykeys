/* globals shuffleArray, PROCEDURAL_MAZE, dice, drawMazeIntoCanvas */
/* exported generateNewMaze */
"use strict";

/**
 * Generates a new maze.
 */
function generateNewMaze(width, height, seed, mode) {
    Math.seedrandom(seed);
    var grid = buildGrid(width, height);
    generateMaze(grid, width, height, mode);
    carveEntrances(grid);
    drawMazeIntoCanvas(grid);
    return grid;
}

/**
 * Initializes a grid and returns it.
 * 
 * The grid will contain an integer, and this integer will be 
 * used as a 4-bit number, each bit indicating if the cell is
 * open (1) to a particular direction or if it is blocked by
 * a wall (0).
 * 
 * Examples:
 *  3 = 0011 = open to the south and the north.
 *  9 = 1001 = open to the west and the north.
 * 
 * See 'mazeDirection' object.
 */
function buildGrid(width, height) {
    var grid = [];

    for (var j = 0; j < height; j++) {
        grid[j] = [];

        for (var i = 0; i < width; i++) {
            grid[j][i] = 0;
        }
    }

    return grid;
}

/**
 * The growing tree algorithm!
 */
function generateMaze(grid, width, height, randomness) {
    var cells = [];
    var index = -1;
    var directions = [];
    var nx = -1;
    var ny = -1;

    var x = dice(0, width - 1);
    var y = dice(0, height - 1);

    cells.push([x, y]);

    while (cells.length > 0) {

        if (randomness <= dice(0, 99)) {
            index = cells.length - 1;
        } else {
            index = dice(0, cells.length - 1);
        }

        x = cells[index][0];
        y = cells[index][1];

        directions = [
            PROCEDURAL_MAZE.config.directions.north,
            PROCEDURAL_MAZE.config.directions.south,
            PROCEDURAL_MAZE.config.directions.east,
            PROCEDURAL_MAZE.config.directions.west
        ];

        directions = shuffleArray(directions);

        for (var i = 0; i < directions.length; i++) {
            nx = x + getDeltaX(directions[i]);
            ny = y + getDeltaY(directions[i]);

            if ((nx >= 0) && (ny >= 0) && (nx < width) && (ny < height) && (grid[ny][nx] === 0)) {
                grid[y][x] |= directions[i];
                grid[ny][nx] |= getOppositeDirecction(directions[i]);
                cells.push([nx, ny]);
                index = -1;
                break;
            }
        }

        if (index > -1) {
            cells.splice(index, 1);
        }
    }

    return grid;
}

/**
 * Function to aid with calculating horizontal shifting.
 */
function getDeltaX(direction) {
    var directions = PROCEDURAL_MAZE.config.directions;
    
    if (direction === directions.east) {
        return 1;
    } else if (direction === directions.west) {
        return -1;
    } else {
        return 0;
    }
}

/**
 * Function to aid with calculating vertical shifting.
 */
function getDeltaY(direction) {
    var directions = PROCEDURAL_MAZE.config.directions;
    
    if (direction === directions.north) {
        return -1;
    } else if (direction === directions.south) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * Function that returns the parameter's opposite direccion.
 */
function getOppositeDirecction(direction) {
    var directions = PROCEDURAL_MAZE.config.directions;
    
    if (direction === directions.east) {
        return directions.west;
    } else if (direction === directions.west) {
        return directions.east;
    } else if (direction === directions.north) {
        return directions.south;
    } else if (direction === directions.south) {
        return directions.north;
    }
}

/**
 * Carves two entrances/exits into the maze's external walls.
 */
function carveEntrances(grid) {
    var directions = PROCEDURAL_MAZE.config.directions;
    
    var width = grid[0].length;
    var height = grid.length;

    // West entrance:
    grid[dice(0, height - 1)][0] |= directions.west;

    // East entrance:
    grid[dice(0, height - 1)][width - 1] |= directions.east;
}
