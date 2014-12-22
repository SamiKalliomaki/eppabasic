$(function() {
    var password = '';

    function genHashData(actions) {
        var date = Math.round((new Date).getTime() / 1000);
        var pass = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(date + password + actions));

        return { date: date, pass: pass, actions: actions };
    }

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
        var d = genHashData(actions);

        $.post('backend/', JSON.stringify(d), function(response) {
            fillResponse(response);
        });
    }

    $('button').click(function() {
        doRequest($(this).data('action'));
    });

    $('form').submit(function(e) {
        e.preventDefault();

        password = $('#password').val();
        var d = genHashData('');

        $.post('backend/', JSON.stringify(d), function(response) {
            // Success, correct password

            $('#login-content').slideUp();
            $('#main-content').fadeIn();

            (function(){
                doRequest('');

                setTimeout(arguments.callee, 1000);
            })();
        }).fail(function() {
            $('form')[0].reset();
        });
    });
});