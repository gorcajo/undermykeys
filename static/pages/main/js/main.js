/* globals $, initMouldify */
"use strict";

$(document).ready(function () {
    var menuItem = $("a[href='" + window.location.pathname + "']").parent();
    menuItem.addClass("active");
    menuItem.parent().parent().addClass("active");

    initMouldify();
});
