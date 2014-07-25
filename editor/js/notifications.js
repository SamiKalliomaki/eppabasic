function NotificationSystem(notificationBox) {
    this.notificationBox = $(notificationBox);
}

NotificationSystem.prototype = {
    notify: function(text) {
        var notif = document.createElement('div');

        $(notif).addClass('notification')
            .text(text)
            .css('display', 'none')
            .fadeIn(200)
            .delay(5000)
            .fadeOut(200);

        this.notificationBox.append(notif);
    },

    showErrors: function(errors) {
        error_arr = []

        for(var name in errors) {
            header = (name === '__all__') ? '' : name + ': ';
            error_arr.push(header + errors[name].join(' '));
        }

        this.notify(error_arr.join('\n\n'));
    }
}