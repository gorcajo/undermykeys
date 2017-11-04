/* globals alert, $, Over15VM, Disassembler */
/* exported OVER15_BROWSER_DEBUGGER */
"use strict";

var OVER15_BROWSER_DEBUGGER = {
    vm: null,
    disassembler: null,
    loadedBinaries: "",
    codePagination: {
        currentPage: 1,
        bytesPerPage: 32
    },
    runConfig: {
        intervalId: null,
        intervalMillis: 50,
        running: false
    },

    init: function() {
        this.loadedBinaries = localStorage.getItem("lastBinaries");

        this.vm = new Over15VM();
        this.disassembler = new Disassembler();

        this.pauseIfRunning();
        this.vm.hardReset();
        this.vm.loadBinaries(this.getBinariesFromBase64(this.loadedBinaries));
        this.codePagination.currentPage = 1;
        this.updateAll();
        this.unHighlightCells();

        $("#modal-load").on("shown.bs.modal", function () {
            $("#txt-base64-binaries").select();
        });

        $("#btn-load").click(function() {
            var over15 = OVER15_BROWSER_DEBUGGER;
            over15.pauseIfRunning();
            over15.vm.hardReset();
            over15.loadedBinaries = $("#txt-base64-binaries").val();
            over15.vm.loadBinaries(over15.getBinariesFromBase64(over15.loadedBinaries));
            over15.codePagination.currentPage = 1;
            over15.updateAll();
            over15.unHighlightCells();

            localStorage.setItem("lastBinaries", over15.loadedBinaries);
        });

        $("#modal-load").on("hidden.bs.modal", function () {
            window.setTimeout(function() {
                $("#btn-open-modal").blur();
            }, 1);
        });

        $("#btn-reset").click(function() {
            var over15 = OVER15_BROWSER_DEBUGGER;

            over15.pauseIfRunning();
            over15.vm.hardReset();
            over15.vm.loadBinaries(over15.getBinariesFromBase64(over15.loadedBinaries));
            over15.codePagination.currentPage = 1;
            over15.updateAll();
            over15.unHighlightCells();

            $(this).blur();
        });

        $("#btn-run").click(function() {
            var over15 = OVER15_BROWSER_DEBUGGER;
            over15.runIfNotRunning();
            $(this).blur();
        });
        $("#btn-pause").click(function() {
            var over15 = OVER15_BROWSER_DEBUGGER;
            over15.pauseIfRunning();
            $(this).blur();
        });

        $("#btn-step").click(function() {
            var over15 = OVER15_BROWSER_DEBUGGER;
            over15.stepIfNotRunning();
            $(this).blur();
        });

        $("#a-prev").click(function() {
            var over15 = OVER15_BROWSER_DEBUGGER;

            if (over15.codePagination.currentPage > 1) {
                over15.codePagination.currentPage--;
                over15.updateCurrentPage();
                over15.updateProgramSection();
            }

            $(this).blur();
        });

        $("#a-next").click(function() {
            var over15 = OVER15_BROWSER_DEBUGGER;

            var totalPages = over15.vm.getMemorySize() / over15.codePagination.bytesPerPage;

            if (over15.codePagination.currentPage < totalPages) {
                over15.codePagination.currentPage++;
                over15.updateCurrentPage();
                over15.updateProgramSection();
            }

            $(this).blur();
        });
    },

    runIfNotRunning: function() {
        $("#btn-run").removeClass("btn-primary");
        $("#btn-run").addClass("btn-warning");

        if (this.runConfig.running === false) {
            this.runConfig.running = true;

            this.runConfig.intervalId = window.setInterval(function() {
                var over15 = OVER15_BROWSER_DEBUGGER;

                // If this page no longer exists, stops the execution:
                if ($('#btn-run').length === 0) {
                    over15.pauseIfRunning();
                }
                // Else...
                else if (OVER15_BROWSER_DEBUGGER.runConfig.running === true) {
                    over15.step();
                }
            }, this.runConfig.intervalMillis);
        }
    },

    stepIfNotRunning: function() {
        if (this.runConfig.running === false) {
            this.step();
        }
    },

    pauseIfRunning: function() {
        $("#btn-run").removeClass("btn-warning");
        $("#btn-run").addClass("btn-primary");

        this.runConfig.running = false;

        if (this.runConfig.intervalId !== null) {
            window.clearInterval(this.runConfig.intervalId);
            this.runConfig.running = false;
        }
    },

    step: function() {
        var previousPc = this.vm.getProgramCounter();
        this.vm.step();

        if (this.vm.getRflag() === true) {
            this.pauseIfRunning();
            this.vm.setProgramCounter(previousPc);
        }

        this.codePagination.currentPage = Math.floor(this.vm.getProgramCounter() / this.codePagination.bytesPerPage) + 1;
        this.updateAll();
    },

    updateAll: function() {
        this.updateStatusSection();
        this.updateCurrentPage();
        this.updateProgramSection();
    },

    updateStatusSection: function() {
        // Program Counter:
        this.updateCell("#cell-pc", this.formatHex(this.vm.getProgramCounter(), 4) + "h");

        // Stack Pointer:
        this.updateCell("#cell-sp", this.formatHex(this.vm.getStackPointer(), 1) + "h");

        // Accumulators:
        this.updateCell("#cell-acc", this.formatHex(this.vm.getRegister(0xA), 4) + "h");
        this.updateCell("#cell-bacc", this.formatHex(this.vm.getRegister(0xB), 4) + "h");

        // Ports:
        this.updateCell("#cell-port-c", this.formatHex(this.vm.getPortC(), 2) + "h");
        this.updateCell("#cell-port-d", this.formatHex(this.vm.getPortD(), 2) + "h");

        // Flags:
        this.updateCell("#cell-flag-c", this.formatFlag(this.vm.getCflag()));
        this.updateCell("#cell-flag-b", this.formatFlag(this.vm.getBflag()));
        this.updateCell("#cell-flag-r", this.formatFlag(this.vm.getRflag()));
        this.updateCell("#cell-flag-o", this.formatFlag(this.vm.getOflag()));
        this.updateCell("#cell-flag-l", this.formatFlag(this.vm.getLflag()));
        this.updateCell("#cell-flag-e", this.formatFlag(this.vm.getEflag()));
        this.updateCell("#cell-flag-g", this.formatFlag(this.vm.getGflag()));

        // Stack:
        this.updateCell("#cell-stack-0", this.formatHex(this.vm.getStackElement(0x0), 4) + "h");
        this.updateCell("#cell-stack-1", this.formatHex(this.vm.getStackElement(0x1), 4) + "h");
        this.updateCell("#cell-stack-2", this.formatHex(this.vm.getStackElement(0x2), 4) + "h");
        this.updateCell("#cell-stack-3", this.formatHex(this.vm.getStackElement(0x3), 4) + "h");
        this.updateCell("#cell-stack-4", this.formatHex(this.vm.getStackElement(0x4), 4) + "h");
        this.updateCell("#cell-stack-5", this.formatHex(this.vm.getStackElement(0x5), 4) + "h");
        this.updateCell("#cell-stack-6", this.formatHex(this.vm.getStackElement(0x6), 4) + "h");
        this.updateCell("#cell-stack-7", this.formatHex(this.vm.getStackElement(0x7), 4) + "h");
        this.updateCell("#cell-stack-8", this.formatHex(this.vm.getStackElement(0x8), 4) + "h");
        this.updateCell("#cell-stack-9", this.formatHex(this.vm.getStackElement(0x9), 4) + "h");
        this.updateCell("#cell-stack-a", this.formatHex(this.vm.getStackElement(0xa), 4) + "h");
        this.updateCell("#cell-stack-b", this.formatHex(this.vm.getStackElement(0xb), 4) + "h");
        this.updateCell("#cell-stack-c", this.formatHex(this.vm.getStackElement(0xc), 4) + "h");
        this.updateCell("#cell-stack-d", this.formatHex(this.vm.getStackElement(0xd), 4) + "h");
        this.updateCell("#cell-stack-e", this.formatHex(this.vm.getStackElement(0xe), 4) + "h");
        this.updateCell("#cell-stack-f", this.formatHex(this.vm.getStackElement(0xf), 4) + "h");

        // Registers' hex values:
        this.updateCell("#cell-r0-hex", this.formatHex(this.vm.getRegister(0x0), 4) + "h");
        this.updateCell("#cell-r1-hex", this.formatHex(this.vm.getRegister(0x1), 4) + "h");
        this.updateCell("#cell-r2-hex", this.formatHex(this.vm.getRegister(0x2), 4) + "h");
        this.updateCell("#cell-r3-hex", this.formatHex(this.vm.getRegister(0x3), 4) + "h");
        this.updateCell("#cell-r4-hex", this.formatHex(this.vm.getRegister(0x4), 4) + "h");
        this.updateCell("#cell-r5-hex", this.formatHex(this.vm.getRegister(0x5), 4) + "h");
        this.updateCell("#cell-r6-hex", this.formatHex(this.vm.getRegister(0x6), 4) + "h");
        this.updateCell("#cell-r7-hex", this.formatHex(this.vm.getRegister(0x7), 4) + "h");
        this.updateCell("#cell-r8-hex", this.formatHex(this.vm.getRegister(0x8), 4) + "h");
        this.updateCell("#cell-r9-hex", this.formatHex(this.vm.getRegister(0x9), 4) + "h");
        this.updateCell("#cell-ra-hex", this.formatHex(this.vm.getRegister(0xa), 4) + "h");
        this.updateCell("#cell-rb-hex", this.formatHex(this.vm.getRegister(0xb), 4) + "h");
        this.updateCell("#cell-rc-hex", this.formatHex(this.vm.getRegister(0xc), 4) + "h");
        this.updateCell("#cell-rd-hex", this.formatHex(this.vm.getRegister(0xd), 4) + "h");
        this.updateCell("#cell-re-hex", this.formatHex(this.vm.getRegister(0xe), 4) + "h");
        this.updateCell("#cell-rf-hex", this.formatHex(this.vm.getRegister(0xf), 4) + "h");

        // Registers' binary values:
        this.updateCell("#cell-r0-bin", this.formatBin(this.vm.getRegister(0x0)));
        this.updateCell("#cell-r1-bin", this.formatBin(this.vm.getRegister(0x1)));
        this.updateCell("#cell-r2-bin", this.formatBin(this.vm.getRegister(0x2)));
        this.updateCell("#cell-r3-bin", this.formatBin(this.vm.getRegister(0x3)));
        this.updateCell("#cell-r4-bin", this.formatBin(this.vm.getRegister(0x4)));
        this.updateCell("#cell-r5-bin", this.formatBin(this.vm.getRegister(0x5)));
        this.updateCell("#cell-r6-bin", this.formatBin(this.vm.getRegister(0x6)));
        this.updateCell("#cell-r7-bin", this.formatBin(this.vm.getRegister(0x7)));
        this.updateCell("#cell-r8-bin", this.formatBin(this.vm.getRegister(0x8)));
        this.updateCell("#cell-r9-bin", this.formatBin(this.vm.getRegister(0x9)));
        this.updateCell("#cell-ra-bin", this.formatBin(this.vm.getRegister(0xa)));
        this.updateCell("#cell-rb-bin", this.formatBin(this.vm.getRegister(0xb)));
        this.updateCell("#cell-rc-bin", this.formatBin(this.vm.getRegister(0xc)));
        this.updateCell("#cell-rd-bin", this.formatBin(this.vm.getRegister(0xd)));
        this.updateCell("#cell-re-bin", this.formatBin(this.vm.getRegister(0xe)));
        this.updateCell("#cell-rf-bin", this.formatBin(this.vm.getRegister(0xf)));
    },

    updateCurrentPage: function() {
        var totalPages = this.vm.getMemorySize() / this.codePagination.bytesPerPage;
        $("#a-page").html(this.codePagination.currentPage + "/" + totalPages);
    },

    updateProgramSection: function() {
        var content = "";

        var firstInstructionThisPage = this.codePagination.bytesPerPage * (this.codePagination.currentPage - 1);
        var lastInstructionThisPage = (this.codePagination.bytesPerPage * this.codePagination.currentPage) - 1;

        for (var i = firstInstructionThisPage; i <= lastInstructionThisPage; i++) {
            if (i === this.vm.getProgramCounter())
                content += "<span class='hightlightedline'> >></span>";
            else
                content += "   ";

            content += " ";

            var address = this.formatHex(i, 4);
            var value = this.formatHex(this.vm.getMemoryAt(i), 2);
            content += address + "   " + value;

            content += "     ";

            if (i === this.vm.getProgramCounter())
                content += "<span class='hightlightedline'>";

            this.disassembler.dissasemble(this.vm.getWholeMemory());
            content += this.disassembler.getCodeAtLine(i);

            if (i === this.vm.getProgramCounter())
                content += "</span>";

            content += "\n";
        }

        $("#txt-program").html(content);
    },

    updateCell: function(selector, newValue) {
        if (selector === "#cell-flag-r") {
            $(selector).html(newValue);

            if (newValue === "1") {
                $(selector).addClass("hightlightedcell-error");
            }
            else if (newValue === "0") {
                $(selector).removeClass("hightlightedcell-error");
            }
        }
        else {
            if ($(selector).html() !== newValue) {
                $(selector).html(newValue);
                $(selector).addClass("hightlightedcell");
            }
            else {
                $(selector).removeClass("hightlightedcell");
            }
        }
    },

    unHighlightCells: function() {
        // Little workaround:
        this.updateAll();
    },

    formatHex: function(value, digits) {
        var baseStr = "";

        for (var i = 0; i < digits; i++)
            baseStr += "0";

        return (baseStr + value.toString(16)).substr(-digits);
    },

    formatFlag: function(value) {
        if (value === true)
            return "1";
        else
            return "0";
    },

    formatBin: function(value) {
        if (value > 0xffff)
            return null;

        var binStr = "";

        for (var i = 15; i >= 0; i--) {
            var mask = Math.pow(2, i);

            if ((value & mask) === 0)
                binStr += "0";
            else
                binStr += "1";
        }

        return binStr.substring(0, 4) + " " + binStr.substring(4, 8) + " " + binStr.substring(8, 12) + " " + binStr.substring(12);
    },

    getBinariesFromBase64: function() {
        var bytes = new Uint8Array(this.vm.getMemorySize());

        for (var i = 0; i < bytes.length; i++)
            bytes[i] = 0xff;

        try {
            var binaryString = atob(this.loadedBinaries);

            for (i = 0; i < binaryString.length; i++)
                bytes[i] = binaryString.charCodeAt(i);
        }
        catch (err) {
            alert("Invalid Base64 string!");
        }
        finally {
            // If we run too much code before END mnemonic the debugger will run
            // too slow, so here is a workaround that will truncate everithing
            // after this memory position but will improve performance...
            // Simply the browser has limitations :)
            bytes[2048] = 0x00; // The workaround is just this line

            return bytes;
        }
    }
};
