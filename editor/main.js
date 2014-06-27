window.addEventListener('load', function init() {
    var editor = new Editor("editor", document.getElementById('manual'));
    window.ebeditor = editor;

    $('#editor').resizable({
        resize: function(e, ui) {
            ui.element.css("flex-basis", ui.size.width);
        },
        handles: "e"
    });

    var openedFile = null;

    document.getElementById('new').addEventListener('click', function() {
        editor.setCode('');
        openedFile = null;
    });
    document.getElementById('load').addEventListener('click', function() {
        fileDialog(false, function(form) {
            submitForm(form, 'eb/fs/open/', function(data) {
                editor.setCode(data['content']);
            });

            openedFile = getFormFile();
        });
    });
    document.getElementById('save').addEventListener('click', function() {
        function callback(form) {
            submitForm(form, 'eb/fs/save/', function(data) {}, { 'content': editor.getCode() });
            openedFile = getFormFile();
        }

        if(openedFile === null) {
            fileDialog(true, callback);
        } else {
            setFormFile(openedFile);
            callback($('#file-dialog form'));
        }
    });
    document.getElementById('save-as').addEventListener('click', function() {
        fileDialog(true, function callback(form) {
            submitForm(form, 'eb/fs/save/', function(data) {}, { 'content': editor.getCode() });
            openedFile = getFormFile();
        });
    });

    function compilerun() {
        editor.parse();
        editor.compile();

        editor.runtimeReady(function ready() {
            editor.window.ebruntime.init();
            editor.window.ebruntime.start();
        });
        editor.openRuntime();
    }
    document.getElementById('compilerun').addEventListener('click', compilerun);

    document.getElementById('compileview').addEventListener('click', function compileview() {
        var ast = editor.parse();
        editor.compile(ast);

        var code = editor.compiled;
        // TODO Should really be manual box instead of errbox
        editor.errBox.innerHTML = code.replace(/\n/g, '<br>');

        // editor.runtimeReady(function ready() {
        //     var code = editor.window.document.documentElement.innerHTML;
        //     editor.closeRuntime();
        //
        //     alert(code);
        // });
        // editor.openRuntime();
    }, false);

    // Keyboard listener
    document.body.addEventListener('keydown', function keydown(e) {
        if (e.keyCode == 116 || (e.keyCode == 82 && e.ctrlKey)) {
            // F5 or CTRL+R
            try {
                compilerun();
            } finally {
                e.preventDefault();
                return false;
            }
        }
        if (e.keyCode == 112) {
            // F1
            // TODO Show help
        }
    }, true);

    // Tell user about page reload
    window.addEventListener('beforeunload', function beforunload(e) {
        e.preventDefault();
        return "Are you sure you want to refresh this page. All your code is lost."
    });

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
