/// <reference path="utils/string.js" />

function GraphicsText(canvasHolder, heap) {
    this.console = document.createElement('div');
    canvasHolder.appendChild(this.console);

    this.strUtil = new StringUtils(heap);

    // Make all functions to use right this
    for (func in this.env) {
        if (this.env.hasOwnProperty(func))
            this.env[func] = this.env[func].bind(this);
    }
}

GraphicsText.prototype = {


    /*
     * Functions for the program
     */
    env: {
        // TODO Console showing and hiding
        showConsole: function showConsole(sp) {
            //this.canvas.style.visibility = "hidden";
        },
        hideConsole: function hideConsole(sp) {
            //this.canvas.style.visibility = "visible";
        },

        printStr: function print(str) {
            str = this.strUtil.toString(str);

            alert(str);
        },
        printInt: function printInt(a) {
            alert(a);
        },
        printDbl: function printDbl(a) {
            alert(a);
        }
    },
    stdlib: {}
};