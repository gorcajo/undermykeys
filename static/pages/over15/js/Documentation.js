/* globals $, showdown */
/* exported OVER15_DOCUMENTATION */
"use strict";

var OVER15_DOCUMENTATION = {
    init: function() {
        $.getScript("/static/lib/showdown.min.js", function(){
            $.get("/static/pages/over15/assets/doc.md", function(data) {
                var converter = new showdown.Converter({tables: true});

                $("#doc-container").html(converter.makeHtml(data));

                $("table").addClass("table");
                $("table").addClass("table-condensed");
                $("table").addClass("table-hover");
                $("table").addClass("table-bordered");

                OVER15_DOCUMENTATION.createContents({insertLinks: false});
            });
        });
    },

    createContents: function(options) {
        $("#contents-container").empty();

        var list = "";
        var previousTag = "h1";

        $("h2,h3,h4").each(function(index) {
            var id = $(this).attr("id");

            if (id !== "h-contents") {
                var currentTag = $(this).prop("tagName").toLowerCase();

                var newElement = "";
                newElement += "<li>";

                if (options.insertLinks === true) {
                    newElement += "<a ";
                    newElement += "id='contents-" + index + "'";
                    newElement += "data-link-to='" + id + "'";
                    newElement += ">";
                }

                newElement += $(this).html();
                newElement += "</li>";

                if (currentTag === "h2") {
                    if (previousTag === "h3") {
                        newElement = "</ul>" + newElement;
                    }
                    else if (previousTag === "h4") {
                        newElement = "</ul>" + newElement;
                        newElement = "</ul>" + newElement;
                    }
                }
                else if (currentTag === "h3") {
                    if (previousTag === "h2") {
                        newElement = "<ul>" + newElement;
                    }
                    else if (previousTag === "h4") {
                        newElement = "</ul>" + newElement;
                    }
                }
                else if (currentTag === "h4") {
                    if (previousTag === "h3") {
                        newElement = "<ul>" + newElement;
                    }
                }

                list += newElement;
                previousTag = currentTag;
            }
        });

        $("#contents-container").append(list);

        if (options.insertLinks === true) {
            $("a").each(function() {
                var linkTo = $(this).attr('data-link-to');

                if ((typeof linkTo !== typeof undefined) && (linkTo !== false)) {
                    $(this).click(function() {
                        $("#" + linkTo)[0].scrollIntoView();
                    });
                }
            });
        }
    }
};
