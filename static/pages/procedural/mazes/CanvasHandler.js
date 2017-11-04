/* globals createjs, PROCEDURAL_MAZE */
/* exported intializeStage, drawTextIntoCanvasAtTile, updateStage, resetMaze, connectTiles */
"use strict";

var canvasElement = null;
var stage = null;

/**
 * Initializes the stage from the canvas element.
 */
function intializeStage(canvasElement, width, height) {
    var tileSize = PROCEDURAL_MAZE.config.tileSize;
    
    stage = new createjs.Stage(canvasElement[0]);
    canvasElement.attr("width", width * tileSize);
    canvasElement.attr("height", height * tileSize);
}

/**
 * Prints the maze out within a 2D Canvas.
 */
function drawMazeIntoCanvas(grid) {
    var tileSize = PROCEDURAL_MAZE.config.tileSize;
    var directions = PROCEDURAL_MAZE.config.directions;
    var wallsWidth = PROCEDURAL_MAZE.config.wallsWidth;

    var width = grid[0].length;
    var height = grid.length;

    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            var cell = new createjs.Container();
            cell.x = i * tileSize;
            cell.y = j * tileSize;

            var wall = null;

            if ((grid[j][i] & directions.north) === 0) {
                wall = new createjs.Shape();

                wall.graphics
                    .setStrokeStyle(wallsWidth)
                    .beginStroke("#000000")
                    .moveTo(0, 0)
                    .lineTo(tileSize, 0)
                    .endStroke();

                cell.addChild(wall);
            }

            if ((grid[j][i] & directions.east) === 0) {
                wall = new createjs.Shape();

                wall.graphics
                    .setStrokeStyle(wallsWidth)
                    .beginStroke("#000000")
                    .moveTo(tileSize, 0)
                    .lineTo(tileSize, tileSize)
                    .endStroke();

                cell.addChild(wall);
            }

            if ((grid[j][i] & directions.south) === 0) {
                wall = new createjs.Shape();

                wall.graphics
                    .setStrokeStyle(wallsWidth)
                    .beginStroke("#000000")
                    .moveTo(0, tileSize)
                    .lineTo(tileSize, tileSize)
                    .endStroke();

                cell.addChild(wall);
            }

            if ((grid[j][i] & directions.west) === 0) {
                wall = new createjs.Shape();

                wall.graphics
                    .setStrokeStyle(wallsWidth)
                    .beginStroke("#000000")
                    .moveTo(0, 0)
                    .lineTo(0, tileSize)
                    .endStroke();

                cell.addChild(wall);
            }

            stage.addChild(cell);
        }
    }

    stage.update();
}

/**
 * Prints the maze out within a 2D Canvas.
 * WARNING: It requires to call updateStage() to actually print the lines.
 */
function drawTextIntoCanvasAtTile(text, x, y) {
    var textGraphic = new createjs.Text(text, "7px Monospace", "#00aa00");
    textGraphic.setTransform(x * PROCEDURAL_MAZE.config.tileSize, y * PROCEDURAL_MAZE.config.tileSize);
    stage.addChild(textGraphic);
}

/**
 * Prints a line connecting two tiles.
 * WARNING: It requires to call updateStage() to actually print the lines.
 */
function connectTiles(xi, yi, xf, yf) {
    var tileSize = PROCEDURAL_MAZE.config.tileSize;
    var solutionLineWidth = PROCEDURAL_MAZE.config.solutionLineWidth;
    var solutionLineColor = PROCEDURAL_MAZE.config.solutionLineColor;
    
    var line = new createjs.Shape();

    line.graphics
        .setStrokeStyle(solutionLineWidth)
        .beginStroke(solutionLineColor)
        .moveTo((xi * tileSize) + (tileSize / 2), (yi * tileSize) + (tileSize / 2))
        .lineTo((xf * tileSize) + (tileSize / 2), (yf * tileSize) + (tileSize / 2))
        .endStroke();

    stage.addChild(line);
}

/**
 * Updates the stages, redrawing everything.
 */
function updateStage() {
    stage.update();
}

/**
 * Un-resolves the maze:
 */
function resetMaze(grid) {
    stage = new createjs.Stage(canvasElement);
    drawMazeIntoCanvas(grid);
}
