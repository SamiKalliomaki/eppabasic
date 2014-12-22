$(function() {
    function setStatus(target, newStatus) {
        target.removeClass('fetching'   );
        target.removeClass('online'     );
        target.removeClass('offline'    );
        target.removeClass('idle'       );
        target.removeClass('working'    );
        target.addClass(newStatus);
    }

    function fillResponse(response) {
        setStatus($('#backend-server-status'), response['backend']);
        setStatus($('#cpanel-server-status'), response['status']);

        $('#log').text(response['log']);

        $('#queue').empty();
        var queue = response['queue'];
        for(var i = 0; i < queue.length; i++) {
            var elem = $('<div/>')
                .addClass('list-group-item')
                .text(queue[i]);

            if(i == 0) {
                elem.addClass('active');
            }

            $('#queue').append(elem);
        }
    }

    function doRequest(actions) {
        $.post('backend/', JSON.stringify({ actions: actions }), function(response) {
            fillResponse(response);
        });
    }

    $('button').click(function() {
        doRequest($(this).data('action'));
    });

    (function(){
        doRequest();

        setTimeout(arguments.callee, 100);
    })();
});