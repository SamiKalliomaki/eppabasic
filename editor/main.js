window.addEventListener('load', function init() {
	var editor = new Editor("editor", document.getElementById('manual'));
    window.ebeditor = editor;

    $('#editor').resizable({
        resize: function(e, ui) {
            ui.element.css("flex-basis", ui.size.width);
        },
        handles: "e"
    });

    document.getElementById('compilerun').addEventListener('click', function compilerun() {
        editor.parse();
        editor.compile();

        editor.runtimeReady(function ready() {
            editor.window.ebruntime.init();
            editor.window.ebruntime.start();
        });
        editor.openRuntime();
    });
    document.getElementById('compileview').addEventListener('click', function compileview() {
        editor.parse();
        editor.compile();

        editor.runtimeReady(function ready() {
            var code = editor.window.document.documentElement.innerHTML;
            editor.closeRuntime();

            alert(code);
        });
        editor.openRuntime();
    }, false);
    //document.getElementById('compile&download').addEventListener('click', function compiledownload() {
    //    editor.parse();
    //    editor.compile();

    //    editor.runtimeReady(function ready() {
    //        var code = editor.window.document.documentElement.innerHTML;
    //        editor.closeRuntime();

    //        var blob = new Blob([code]);
    //        var url = URL.createObjectURL(blob);
    //        document.getElementById('downloadlink').href = url;
    //    });
    //    editor.openRuntime();
    //}, false);
});