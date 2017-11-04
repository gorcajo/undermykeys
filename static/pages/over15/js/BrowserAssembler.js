/* globals $, CodeMirror, Assembler */
/* exported OVER15_BROWSER_ASSEMBLER */
"use strict";

var OVER15_BROWSER_ASSEMBLER = {
    assembler: null,
    editor: null,
    b64encodedBinaries: "",

    init: function() {
        this.assembler = new Assembler();
        this.b64encodedBinaries = "";

        this.editor = CodeMirror.fromTextArea($("#txt-source")[0], {
            lineNumbers: true,
            autofocus: true,
            cursorHeight: 0.85,
            viewportMargin: 20
        });

        this.editor.on("change", function() {
            $("#btn-debug-it").hide(100);
        });

        if (localStorage.getItem("lastSource") !== null)
            this.editor.getDoc().setValue(localStorage.getItem("lastSource"));

        $("#a-new-code").click(function() {
            $("#btn-debug-it").hide(100);
            
            var over15 = OVER15_BROWSER_ASSEMBLER;
            over15.editor.getDoc().setValue("");
            over15.editor.focus();
            $("#txt-output").val("");
        });

        $("#a-example1").click(function() {
            $("#btn-debug-it").hide(100);
            
            $.get("/static/pages/over15/assets/exponentiation.asm", function(data) {
                var over15 = OVER15_BROWSER_ASSEMBLER;
                over15.editor.getDoc().setValue(data);
                $("#txt-output").val("");
            });
        });

        $("#a-example2").click(function() {
            $("#btn-debug-it").hide(100);

            $.get("/static/pages/over15/assets/arrays.asm", function(data) {
                var over15 = OVER15_BROWSER_ASSEMBLER;
                over15.editor.getDoc().setValue(data);
                $("#txt-output").val("");
            });
        });

        $("#btn-assemble").click(function() {
            var over15 = OVER15_BROWSER_ASSEMBLER;
            over15.assemble();
            over15.editor.focus();
        });

        $("#btn-debug-it").click(function() {
            localStorage.setItem("lastSource", OVER15_BROWSER_ASSEMBLER.editor.getDoc().getValue());
            localStorage.setItem("lastBinaries", OVER15_BROWSER_ASSEMBLER.b64encodedBinaries);
            window.location.href = "/web/over15/debugger";
        });
    },

    assemble: function() {
        this.assembler.setSourceCode(this.editor.getDoc().getValue());
        this.assembler.assemble();

        if (this.assembler.wasSuccessful()) {
            var binaries = this.assembler.getBinaries();
            var lastAddress = this.assembler.getLastAddress();
            binaries = binaries.slice(0, lastAddress);
            this.b64encodedBinaries = btoa(String.fromCharCode.apply(null, binaries));

            var message = "";
            message += "Assembly successful!\n";
            message += "\n";
            message += "You can now go to the debugger tool by clicking the 'Debug it!' button.\n";
            message += "\n";
            message += "Also, you can paste these Base64 encoded binaries into the debugger tool through the 'Load' button:\n";
            message += "\n";
            message += this.b64encodedBinaries;

            $("#txt-output").css("color", "green");
            $("#txt-output").val(message);

            $("#btn-debug-it").show(100);
        }
        else {
            this.b64encodedBinaries = "";
            $("#txt-output").css("color", "red");
            $("#txt-output").val(this.assembler.getResultMessage());
            $("#btn-debug-it").hide(100);
        }
    }
};
