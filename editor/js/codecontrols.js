function CodeControlsController(codeControls, editor) {
    this.codeControls = $(codeControls);

    function run() {
        editor.parse();
        editor.compile();

        editor.runtimeReady(function ready() {
            editor.window.ebruntime.init();
            editor.window.ebruntime.start();
        });
        editor.openRuntime();
    }

    $('.run', this.codeControls).click(run);
    $(document).keydown(function keydown(e) {
        if (e.keyCode == 116 || (e.keyCode == 82 && e.ctrlKey)) {
            // F5 or CTRL+R
            try {
                run();
            } finally {
                e.preventDefault();
                return false;
            }
        }
        if (e.keyCode == 112) {
            // F1
            // TODO Show help
        }
    });
}