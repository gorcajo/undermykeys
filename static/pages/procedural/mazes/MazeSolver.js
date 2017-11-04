/* globals PROCEDURAL_MAZE, buildGrid,connectTiles, updateStage */
/* exported solveMaze */
"use strict";

function solveMaze(mazeGrid) {
    var directions = PROCEDURAL_MAZE.config.directions;
    
    var solverGrid = buildGrid(mazeGrid[0].length, mazeGrid.length);

    // Sets the initial position into the solver grid:
    solverGrid[findEntrance(mazeGrid).y][findEntrance(mazeGrid).x] = 1;

    // Sets the destination position into the solver grid:
    solverGrid[findExit(mazeGrid).y][findExit(mazeGrid).x] = -1;

    // Breadth First Search algorithm:
    var finished = false;
    while (!finished) {
        var steps = findFrontier(solverGrid);

        for (var i = 0; i < steps.length; i++) {
            var step = steps[i];

            // Check if we are finished:
            if ((step.north.y >= 0) && (solverGrid[step.north.y][step.north.x] === -1) && ((mazeGrid[step.y][step.x] & directions.north) !== 0)) {
                finished = true;
                break;
            }
            else if ((step.east.x < mazeGrid[0].length) && (solverGrid[step.east.y][step.east.x] === -1) && ((mazeGrid[step.y][step.x] & directions.east) !== 0)) {
                finished = true;
                break;
            }
            else if ((step.south.y < mazeGrid.length) && (solverGrid[step.south.y][step.south.x] === -1) && ((mazeGrid[step.y][step.x] & directions.south) !== 0)) {
                finished = true;
                break;
            }
            else if ((step.west.x >= 0) && (solverGrid[step.west.y][step.west.x] === -1) && ((mazeGrid[step.y][step.x] & directions.west) !== 0)) {
                finished = true;
                break;
            }

            // Push the frontiers:
            if (step.north.x >= 0)
                if ((mazeGrid[step.y][step.x] & directions.north) !== 0)
                    if (solverGrid[step.north.y][step.north.x] === 0)
                        solverGrid[step.north.y][step.north.x] = step.value + 1;

            if (step.east.y < mazeGrid[0].length)
                if ((mazeGrid[step.y][step.x] & directions.east) !== 0)
                    if (solverGrid[step.east.y][step.east.x] === 0)
                        solverGrid[step.east.y][step.east.x] = step.value + 1;

            if (step.south.y < mazeGrid.length)
                if ((mazeGrid[step.y][step.x] & directions.south) !== 0)
                    if (solverGrid[step.south.y][step.south.x] === 0)
                        solverGrid[step.south.y][step.south.x] = step.value + 1;

            if (step.west.x >= 0)
                if ((mazeGrid[step.y][step.x] & directions.west) !== 0)
                    if (solverGrid[step.west.y][step.west.x] === 0)
                        solverGrid[step.west.y][step.west.x] = step.value + 1;
        }
    }

    // Print the Breadth First Search algorithm steps:
    /*
    for (var j = 0; j < solverGrid.length; j++) {
        for (var i = 0; i < solverGrid[0].length; i++) {
            if (solverGrid[j][i] === -1) {
                drawTextIntoCanvasAtTile("X", i, j);
            } else if (solverGrid[j][i] !== 0) {
                drawTextIntoCanvasAtTile(solverGrid[j][i].toString(), i, j);
            }
        }
    }

    updateStage();*/

    // Print the "snake" indicating the solution to the maze:

    var xi = findExit(mazeGrid).x;
    var yi = findExit(mazeGrid).y;
    var xf = -1;
    var yf = -1;

    connectTiles(xi, yi, xi + 1, yi);

    solverGrid[yi][xi] = 999999;

    do {
        if (((yi - 1) >= 0) && (solverGrid[yi-1][xi] < solverGrid[yi][xi]) && (solverGrid[yi-1][xi] !== 0) && ((mazeGrid[yi][xi] & directions.north) !== 0)) {
            xf = xi;
            yf = yi - 1;
        }
        else if (((xi + 1) < solverGrid[0].length) && (solverGrid[yi][xi+1] < solverGrid[yi][xi]) && (solverGrid[yi][xi+1] !== 0) && ((mazeGrid[yi][xi] & directions.east) !== 0)) {
            xf = xi + 1;
            yf = yi;
        }
        else if (((yi + 1) < solverGrid.length) && (solverGrid[yi+1][xi] < solverGrid[yi][xi]) && (solverGrid[yi+1][xi] !== 0) && ((mazeGrid[yi][xi] & directions.south) !== 0)) {
            xf = xi;
            yf = yi + 1;
        }
        else if (((xi - 1) >= 0) && (solverGrid[yi][xi-1] < solverGrid[yi][xi]) && (solverGrid[yi][xi-1] !== 0) && ((mazeGrid[yi][xi] & directions.west) !== 0)) {
            xf = xi - 1;
            yf = yi;
        }

        connectTiles(xi, yi, xf, yf);

        xi = xf;
        yi = yf;
    }
    while (solverGrid[yf][xf] != 1);

    connectTiles(xi, yi, -1, yi);
    updateStage();
}

/**
 * 
 */
function findExit(grid) {
    var directions = PROCEDURAL_MAZE.config.directions;

    for (var i = 0; i < grid.length; i++) {
        if ((grid[i][grid[0].length - 1] & directions.east) !== 0) {
            return {
                x: (grid[0].length - 1),
                y: i
            };
        }
    }
}

/**
 * 
 */
function findEntrance(grid) {
    var directions = PROCEDURAL_MAZE.config.directions;

    for (var i = 0; i < grid.length; i++) {
        if ((grid[i][0] & directions.west) !== 0) {
            return {
                x: 0,
                y: i
            };
        }
    }
}

/**
 * 
 */
function findFrontier(solverGrid) {
    var i = 0;
    var j = 0;

    var steps = [];

    var maxStep = 0;

    for (j = 0; j < solverGrid.length; j++) {
        for (i = 0; i < solverGrid[0].length; i++) {
            if (solverGrid[j][i] > maxStep) {
                maxStep = solverGrid[j][i];
            }
        }
    }

    for (j = 0; j < solverGrid.length; j++) {
        for (i = 0; i < solverGrid[0].length; i++) {
            if (solverGrid[j][i] === maxStep) {
                steps.push({
                    value: maxStep,
                    x: i,
                    y: j,
                    north: {
                        x: i,
                        y: (j - 1)
                    },
                    east: {
                        x: (i + 1),
                        y: j
                    },
                    south: {
                        x: i,
                        y: (j + 1)
                    },
                    west: {
                        x: (i - 1),
                        y: j
                    }
                });
            }
        }
    }

    return steps;
}
