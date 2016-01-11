(function (window) {
    var frameCount = 0;
    var isRunning = false;

    function update () {
        //game.$main.text((frameCount / game.frameRate).toFixed());
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
        //$main: $("#main"),
        update: update,
        tick: tick,
        start: start,
        stop: stop
    };

    // Export global instance.
    window.game = game;

    //game.start();

})(this);

var WIDTH = 724;
var HEIGHT = 500;

var square = document.getElementById("sq");
var sqcontext = square.getContext("2d");
sqcontext.fillRect(0, 0, 20, 20);

var fgCanvas = document.getElementById("fg");

fgCanvas.height = HEIGHT;
fgCanvas.width = WIDTH;

var fg = fgCanvas.getContext("2d");

var gridCanvas = document.getElementById("grid");

gridCanvas.height = HEIGHT;
gridCanvas.width = WIDTH;

var grid = gridCanvas.getContext("2d");



var lastRender = Date.now();

var delta = 4; // Date.now() - lastRender;

function clear(context) {
    //context.fillStyle = 'rgba(255,255,255,1)';
    context.clearRect(0, 0, WIDTH, HEIGHT);
}

var ball = {
    x: 100,
    y: 100,
    vx: 5,
    vy: 1,
    radius: 25,
    color: 'blue',
    draw: function() {
        if (this.x > WIDTH || this.x < 0) {
            this.vx = -this.vx;
        }
        if (this.y > HEIGHT || this.y < 0) {
            this.vy = -this.vy;
        }

        this.x += this.vx;
        this.y += this.vy;

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        context.closePath();
        context.fillStyle = this.color;
        context.fill();
    }
};

var entranceHex;
var exitHex;

function Shape(init) {
    _.extend(this, this.defaults, init);
    return this;
}

Shape.prototype.defaults = {
    x: 0,
    vx: 0, // number or function
    ax: 0, // number or function
    y: 0,
    vy: 0, // number or function
    ay: 0 // number or function
};

Shape.prototype.move = function () {
    this.x += _.result(this, "vx");

    if (!_.isFunction(this.vx)) {
        this.vx += _.result(this, "ax");
    }

    this.y += _.result(this, "vy");

    if (!_.isFunction(this.vy)) {
        this.vy += _.result(this, "ay");
    }
}

Shape.prototype.fill = function (context) {
    context.fillStyle = this.color;
    context.fill();
}

Shape.prototype.stroke = function (context) {
    context.strokeStyle = this.lineColor;
    context.stroke();
}

Shape.prototype.draw = function (context) {
    this.path(context);

    if (this.color) {
        this.fill(context);
    }

    if (this.lineColor) {
        this.stroke(context);
    }
};

function Circle(init) {
    _.extend(this, this.defaults, init);
    return this;
};

Circle.prototype = new Shape();
Circle.prototype.defaults = _.extend({}, Circle.prototype.defaults, {
    radius: 9,
    color: "#4c3"
});

Circle.prototype.path = function (context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
    context.closePath();
};

function Monster(init) {
    _.extend(this, this.defaults, init);

    if (this.hex) {
        this.setHex(this.hex);
    }

    return this;
};

Monster.prototype = new Circle();
Monster.prototype.defaults = {
    vh: 1
};

Monster.prototype.move = function () {
    if (this.targetHex) {
        this.stepsRemaining -= 1;

        this.x = this.targetHex.x;
        this.y = this.targetHex.y;

        if (this.stepsRemaining) {
            this.x -= (this.targetHex.x - this.hex.x) / this.steps * this.stepsRemaining;
            this.y -= (this.targetHex.y - this.hex.y) / this.steps * this.stepsRemaining;
        }

        else {
            this.hex = this.targetHex;
            this.targetHex = null;
        }
    }
};

Monster.prototype.setTargetHex = function (targetHex) {
    this.targetHex = targetHex || this.hex.routeHex;

    if (this.targetHex) {
        this.steps = Math.floor(this.targetHex.size / this.vh);
        this.stepsRemaining = this.steps;
    }
};

Monster.prototype.setHex = function (hex) {
    this.hex = hex;
    this.x = hex.x;
    this.y = hex.y;
};
/*
Monster.prototype.findTargetHex = function () {
    function hasExit(path) {
        return _.find(path.currentHexes, exitHex);
    }

    function hasPath(path) {
        return path.currentHexes.length > 0;
    }

    var paths, visitedHexes, exitPath;

    var pathColors = ["#fcc", "#bfb", "#ccf", "#eff", "#ffc", "#fef"];

    visitedHexes = [this.hex].concat(this.hex.neighbors);
    paths = _.map(this.hex.neighbors, function (hex, index) {
        hex.color = pathColors[index];
        hex.draw(fg);
        fg.strokeText("S" + index, hex.x, hex.y);

        return {
            start: hex,
            currentHexes: [hex],
            color: pathColors[index],
            index: index
        };
    });

    exitPath = _.find(paths, hasExit);

    var pathSteps = 0;

    while (!exitPath && _.find(paths, hasPath)) {
        pathSteps += 1;
        console.log(pathSteps);

        _.each(paths, function (path) {
            var nextHexes =  _.difference(_.unique(_.flatten(_.reduce(path.currentHexes, function (result, hex) {
                return hex.neighbors;
            }, []))), visitedHexes);

            _.each(nextHexes, function (hex) {
                hex.color = path.color;
                hex.draw(fg);
                fg.strokeText(path.index + ":" + pathSteps, hex.x, hex.y);
            });

            visitedHexes = visitedHexes.concat(nextHexes);

            path.currentHexes = nextHexes;
        });

        //paths = _.filter(paths, hasPath);

        _.each(paths, function (path, index) {
            _.each(path.currentHexes, function (hex) {
                console.log(index, "i", hex.i, "j", hex.j, "k", hex.k);
            });
        });

        exitPath = _.find(paths, hasExit);

    }

    return exitPath.start;
};
*/

function Hex(init) {
    _.extend(this, this.defaults, init);

    this.width = this.size * 2;
    this.height =  Math.sqrt(3) / 2 * this.width;

    this.x = WIDTH / 2 + 3 / 4 * this.width * this.i;
    this.y = HEIGHT / 2 + 1 / 2 * this.height * (this.k - this.j);

    return this;
};

Hex.prototype = new Shape();
Hex.prototype.defaults = _.extend({}, Hex.prototype.defaults, {
    i: 0,
    j: 0,
    k: 0,
    size: 20,
    lineColor: "#88c"
});

Hex.prototype.path = function (context) {
    context.beginPath();

    var vertices = _.map([0, 1, 2, 3, 4, 5], this.vertex, this);

    context.moveTo(vertices[0].x, vertices[0].y);

    _.each([1, 2, 3, 4, 5], function (i) {
        context.lineTo(vertices[i].x, vertices[i].y);
    });

    context.closePath();
};

Hex.prototype.vertex = function (i) {
    var rad = Math.PI / 180 * 60 * i;

    return {
        x: this.x + this.size * Math.cos(rad),
        y: this.y + this.size * Math.sin(rad)
    };
};

Hex.prototype.clearRoute = function () {
    this.routeHex = null;
};

Hex.prototype.setRoute = function () {
    var routeHexes = [this];

    //_.each(routeHexes, function (hex) {
    //    if (!hex.isBorder && !hex.routeHex && !hex.structure && !_.find)
    //});

    _.each(this.neighbors, function (hex) {
        if (!hex.isBorder && !hex.routeHex && !hex.structure) {
            hex.routeHex = this;
        }
    }, this);

    _.each(this.neighbors, function (hex) {
        if (hex.routeHex) {
            if (_.reject(_.reject(hex.neighbors, "routeHex"), "structure").length) {
                hex.setRoute();
            }
        }
    }, this);
};

Hex.prototype.drawRoute = function (context) {
    if (this.routeHex) {
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.routeHex.x, this.routeHex.y);
        context.closePath();

        context.strokeStyle = "rgba(128, 128, 128, 0.4)";
        context.stroke();
    }
};


var hexes = [];
var range = _.range(-20, 20);

_.each(range, function (i) {
    _.each(range, function (j) {
        var hex = new Hex({ i: i, j: j, k: 0 - i - j });

        if (hex.x > (-hex.width) &&
            hex.x < (WIDTH + hex.width) &&
            hex.y > (-hex.height) &&
            hex.y < (HEIGHT + hex.height)
        ) {
            // top left (entrance)
            if (hex.x < hex.width && hex.x > 0 && hex.y < hex.height && hex.y > 0) {
                hex.color = "red";
                hex.isEntrance = true;

                entranceHex = hex;
            }

            // bottom right (exit)
            else if (hex.x > WIDTH - hex.width && hex.x < WIDTH && hex.y > HEIGHT - hex.height && hex.y < HEIGHT) {
                hex.color = "red";
                hex.isExit = true;

                if (!exitHex) {
                    exitHex = hex;
                }
            }

            else if (hex.x < hex.size || hex.x > WIDTH - hex.size || hex.y < hex.size || hex.y > HEIGHT - hex.size) {
                hex.color = "#444";
                hex.isBorder = true;
            }

            else {
                hex.isMiddle = true;
            }

            hexes.push(hex);
        }
    });
});

// setup neighbors
_.each(hexes, function (hex) {
    hex.neighbors = _.filter([
        _.find(hexes, { i: hex.i + 1, j: hex.j - 1, k: hex.k }),
        _.find(hexes, { i: hex.i - 1, j: hex.j + 1, k: hex.k }),
        _.find(hexes, { i: hex.i + 1, j: hex.j, k: hex.k - 1 }),
        _.find(hexes, { i: hex.i - 1, j: hex.j, k: hex.k + 1 }),
        _.find(hexes, { i: hex.i, j: hex.j + 1, k: hex.k - 1 }),
        _.find(hexes, { i: hex.i, j: hex.j - 1, k: hex.k + 1 })
    ], function (hex) {
        return hex && !hex.isBorder;
    });
});

_.each(hexes[397].neighbors, function (hex) {
    hex.color = "lightgreen";
});

_.each(_.find(hexes, { i: -9, j: 10, k: -1 }).neighbors, function (hex) {
    hex.color = "yellow";
});

_.each(hexes, function (hex, index) {
    hex.draw(grid);
    grid.strokeText(index, hex.x - 10, hex.y + 20);
});


var circle = new Circle({
    x: 100,
    y: 200,
    vx: function () {
        return 4 * Math.sin(frameCount * Math.PI / 180);
    }
});

_.each([106, 271, 317, 367, 208, 91], function (index) {
        hexes[index].structure = true;
});

var monster = new Monster({ hex: entranceHex });

var frameCount = 0;

function render() {
    clear(fg);

    _.each(hexes, function (hex) {
        hex.clearRoute();
    });

    exitHex.setRoute();

    _.each(hexes, function (hex) {
        hex.drawRoute(fg);
    });

    circle.move();
    circle.draw(fg);

    monster.move();
    monster.draw(fg);

    if (monster.hex && !monster.targetHex) {
        monster.setTargetHex();
    }

    //_.each(hexes, function (hex) {
    //    hex.draw(grid);
    //});

    frameCount += 1;

    //context.fillStyle = "blue";
    //context.drawImage(square, x, y);

    requestAnimationFrame(render);


/*  else {
      context.fillStyle = "rgb(200,0,0)";
      context.fillRect (10, 10, 55, 50);

      context.fillStyle = "rgba(0, 0, 200, 0.5)";
      context.fillRect (30, 30, 55, 50);

      context.beginPath();
    context.moveTo(75,50);
    context.lineTo(100,75);
    context.lineTo(100,25);
    context.fill();

    var ctx = context;

    ctx.beginPath();
    ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
    ctx.moveTo(110,75);
    ctx.arc(75,75,35,0,Math.PI,false);  // Mouth (clockwise)
    ctx.moveTo(65,65);
    ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
    ctx.moveTo(95,65);
    ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
    ctx.stroke();
*/

  //}
}
requestAnimationFrame(render);
