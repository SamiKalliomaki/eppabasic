function CodeControlsController(codeControls, editor) {
    this.codeControls = $(codeControls);

    $('.run', this.codeControls).click(function() { editor.runCode(); });
    $(document).keydown(function keydown(e) {
        if (e.keyCode == 116 || (e.keyCode == 82 && e.ctrlKey)) {
            // F5 or CTRL+R
            try {
                editor.runCode();
            } finally {
                e.preventDefault();
                return false;
            }
        }
        if (e.keyCode == 112) {
            // F1
            // TODO Show help
            editor.showHelp();
        }
    });
}