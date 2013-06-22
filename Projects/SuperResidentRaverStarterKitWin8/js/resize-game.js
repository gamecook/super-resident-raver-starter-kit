window.addEventListener('resize', resizeGame, false);

function resizeGame() {

    var canvas = document.getElementById('canvas');

    var canvasRatio = canvas.width / canvas.height;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var windowRatio = width / height;

    if (windowRatio > canvasRatio) {
        width = height * canvasRatio;
        canvas.style.height = height + 'px';
        canvas.style.width = width + 'px';
    } else {
        height = width / canvasRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    }

    canvas.style.top = (window.innerHeight - height) / 2 + "px";
    canvas.style.left = (window.innerWidth - width) / 2 + "px";

}
