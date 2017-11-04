/* globals $, alert, intializeStage, generateNewMaze, solveMaze,randomSeed */
/* exported PROCEDURAL_MAZE */
"use strict";

var PROCEDURAL_MAZE = {
    config: {
        directions: {
            north: 1,
            south: 2,
            east: 4,
            west: 8
        },

        //Constant for the canvas representation of the maze:
        tileSize: 8,

        //Constants for drawing
        wallsWidth: 2,
        solutionLineWidth: 2,
        solutionLineColor: "#ff4444"
    },

    mazeGrid: [],
    stage: null,

    init: function() {
        $("#maze-seed").val(randomSeed());
        
        $("#randomize").on("mouseup", function() {
            $("#maze-seed").val(randomSeed());
        });

        $("#generate").on("mouseup", function() {
            var width = parseInt($("#maze-width").val());
            var height = parseInt($("#maze-height").val());

            if (width < 2) {
                alert("Maze width must be at least 2");
            } else if (height < 1) {
                alert("Maze height must be at least 1");
            } else {
                intializeStage(
                    $("#maze-canvas"),
                    $("#maze-width").val(),
                    $("#maze-height").val()
                );

                PROCEDURAL_MAZE.mazeGrid = generateNewMaze(
                    $("#maze-width").val(),
                    $("#maze-height").val(),
                    $("#maze-seed").val(),
                    $("#maze-randomness").val()
                );
            }
        });

        $("#solve").on("mouseup", function() {
            solveMaze(PROCEDURAL_MAZE.mazeGrid);
        });

        intializeStage(
            $("#maze-canvas"),
            $("#maze-width").val(),
            $("#maze-height").val()
        );

        this.mazeGrid = generateNewMaze(
            $("#maze-width").val(),
            $("#maze-height").val(),
            $("#maze-seed").val(),
            $("#maze-randomness").val()
        );
    }
};
