function printscreen(container) {
    var canvas = container.getElementsByTagName('canvas')[0];
    var url = canvas.toDataURL();
    window.open(url, (new Date()).getTime(), 'dependent');
}