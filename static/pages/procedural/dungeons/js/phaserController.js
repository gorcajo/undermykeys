/* globals Phaser, constants, settings, datGuiController */
/* exported phaserController */
"use strict";

let phaserController = {

    game: null,

    keyPressedLastFrame: false,

    caveGroup: {},
    itemsGroup: {},

    hKey: {},

    init: function() {
        this.game = new Phaser.Game(
            0,
            0,
            Phaser.AUTO,
            "canvas-container",
            {
                preload: this.preload,
                create:  this.create,
                update:  this.update,
                render:  this.render
            },
            false
        );
    },

    drawGround: function(x, z) {
        let ground = this.game.add.graphics(0, 0);
        ground.beginFill(settings.groundColor);
        ground.lineStyle(1, settings.gridColor, 1);

        let posX = x * settings.tileSize;
        let posZ = z * settings.tileSize;
        let size = settings.tileSize;
        ground.drawRect(posX, posZ, size, size);

        this.caveGroup.add(ground);
    },

    drawRoom: function(x, z, w, h) {
        for (let i = 0; i < w; i++) {
            for (let k = 0; k < h; k++) {
                this.drawGround(x + i, z + k);
            }
        }
    },

    drawVerDoor: function(x, z) {
        this.drawGround(x, z);
        this.drawDoor(x, z, "v");
    },

    drawHorDoor: function(x, z) {
        this.drawGround(x, z);
        this.drawDoor(x, z, "h");
    },

    drawDoor: function(x, z, direction) {
        this.drawGround(x, z);

        let door = this.game.add.graphics(0, 0);
        door.beginFill(settings.doorColor);
        door.lineStyle(1, settings.gridColor, 1);

        let width;
        let length;
        let posX;
        let posZ;

        if (direction === "h") {
            door.moveTo(x * settings.tileSize, z * settings.tileSize + settings.tileSize / 2);
            door.lineTo((x + 1) * settings.tileSize, z * settings.tileSize + settings.tileSize / 2);

            width = settings.tileSize / 2;
            length = settings.tileSize / 3;
        }
        else if (direction === "v") {
            door.moveTo(x * settings.tileSize + settings.tileSize / 2, z * settings.tileSize);
            door.lineTo(x * settings.tileSize + settings.tileSize / 2, (z + 1) * settings.tileSize);

            width = settings.tileSize / 3;
            length = settings.tileSize / 2;
        }
        else {
            throw "Parameter 'direction' must be 'h' or 'v'.";
        }

        posX = x * settings.tileSize + settings.tileSize / 2 - width / 2;
        posZ = z * settings.tileSize + settings.tileSize / 2 - length / 2;

        door.drawRect(posX, posZ, width, length);

        this.caveGroup.add(door);
    },
    
    drawMarker: function(x, z, color) {
        let marker = this.game.add.graphics(0, 0);
        marker.beginFill(color);
        let width = 2;
        let length = 2;
        let posX = x * settings.tileSize + settings.tileSize / 2 - width / 2;
        let posZ = z * settings.tileSize + settings.tileSize / 2 - length / 2;
        marker.drawRect(posX, posZ, width, length);
        this.itemsGroup.add(marker);
    },

    drawWholeMap: function(map) {
        for (let k = 0; k < map.length; k++) {
            for (let i = 0; i < map.width; i++) {
                if ((map.tiles[k][i].type === constants.tileTypes.room) ||
                    (map.tiles[k][i].type === constants.tileTypes.corridor)) {
                    this.drawGround(i, k);
                }
                else if (map.tiles[k][i].type === constants.tileTypes.horizontalDoor) {
                    this.drawHorDoor(i, k);
                }
                else if (map.tiles[k][i].type === constants.tileTypes.verticalDoor) {
                    this.drawVerDoor(i, k);
                }
            }
        }
    },

    destroySprites: function() {
        this.caveGroup.removeAll(true);
        this.itemsGroup.removeAll(true);
    },

    refreshCanvasSize: function() {
        let width =  settings.width * settings.tileSize + 1;
        let length = settings.length * settings.tileSize + 1;
        phaserController.game.scale.setGameSize(width, length);
    },

    preload: function() {
        // ...
    },

    create: function() {
        let pc = phaserController;

        pc.game.stage.backgroundColor = settings.wallColor;

        pc.caveGroup = pc.game.add.group();
        pc.itemsGroup = pc.game.add.group();

        pc.refreshCanvasSize();
        
        pc.hKey = pc.game.input.keyboard.addKey(Phaser.KeyCode.H);

        // WORKAROUND, H key is used by dat.gui to hide/show the gui so we show it again:
        pc.hKey.onDown.add(datGuiController.toggleHide, this);
    }
};