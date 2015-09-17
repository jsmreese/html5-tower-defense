(function (window) {
    var frameCount = 0;
    var isRunning = false;

    function update () {
        game.$main.text((frameCount / game.frameRate).toFixed());
    }

    function tick () {
        var tickStart = Date.now();
        var tickLength;
        var sleep;

        frameCount += 1;

        update();

        tickLength = Date.now() - tickStart;
        sleep = (1 / game.frameRate * 1000 - tickLength).toFixed();

        console.log("Tick", tickLength, sleep);

        if (isRunning) {
            setTimeout(tick, sleep);
        }
    }

    function start () {
        isRunning = true;
        tick();
    }

    function stop () {
        isRunning = false;
    }

    var game = {
        maxFrameRate: 60,
        frameRate: 30,
        frameRateStep: 5,
        $main: $("#main"),
        update: update,
        tick: tick,
        start: start,
        stop: stop
    };

    // Export global instance.
    window.game = game;

    game.start();
})(this);
