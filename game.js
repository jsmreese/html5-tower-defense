(function (window) {
    var $ = window.jQuery;
    var _ = window._;

    var WIDTH = 712;
    var HEIGHT = 500;

    function play() {
        isPaused = false;
        render();
    }

    function pause() {
        isPaused = true;
    }

    function setupCanvas(index, elem) {
        elem.width = WIDTH;
        elem.height = HEIGHT;
        layer[index] = elem.getContext("2d");
    }

    function clear(context) {
        context.clearRect(0, 0, WIDTH, HEIGHT);
    }

    function render() {
        clear(layer[3]);
        clear(layer[4]);

        if (frameCount % 180 === 0) {
            monsters.push(new Monster({ hex: entranceHex }));
        }

        _.each(hexes, _.method("clearRoute"));

        exitHex.setRoute();

        _.each(hexes, _.method("drawRoute", layer[3]));

        _.each(monsters, _.method("update", layer[3]));

        frameCount += 1;

        !isPaused && requestAnimationFrame(render);
    }


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
        radius: 7,
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
        vh: 0.8
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

    Monster.prototype.update = function (context) {
        this.move();
        this.draw(context);

        if (this.hex) {
            if (this.hex.isExit) {
                this.hex = null;
            }

            else if (!this.targetHex) {
                this.setTargetHex();
            }
        }
    }

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
        var stepHexes = [this];
        var nextStepHexes;

        while (stepHexes.length) {
            nextStepHexes = [];

            _.each(stepHexes, function (stepHex) {
                _.each(stepHex.neighbors, function (hex) {
                    if (!hex.isBorder && !hex.routeHex && !hex.structure & !hex.isExit) {
                        hex.routeHex = stepHex;
                        nextStepHexes.push(hex);
                    }
                });
            });

            stepHexes = nextStepHexes;
        }
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

    Hex.prototype.setupNeighbors = function (hexes) {
        this.neighbors = _.compact(_.reject([
            _.find(hexes, { i: this.i + 1, j: this.j - 1, k: this.k }),
            _.find(hexes, { i: this.i - 1, j: this.j + 1, k: this.k }),
            _.find(hexes, { i: this.i + 1, j: this.j, k: this.k - 1 }),
            _.find(hexes, { i: this.i - 1, j: this.j, k: this.k + 1 }),
            _.find(hexes, { i: this.i, j: this.j + 1, k: this.k - 1 }),
            _.find(hexes, { i: this.i, j: this.j - 1, k: this.k + 1 })
        ], "isBorder"));
    };

    var game = {};

    var frameCount = 0;
    var isPaused = true;

    var $document = $(document);
    var $layers = $document.find("canvas");

    var layer = {};

    var entranceHex;
    var exitHex;

    var hexes = [];
    var range = _.range(-20, 20);

    var monsters = [];

    _.each(range, function (i) {
        _.each(range, function (j) {
            var hex = new Hex({ i: i, j: j, k: 0 - i - j });

            if (hex.x > (-hex.width) &&
                hex.x < (WIDTH + hex.width) &&
                hex.y > (-hex.height) &&
                hex.y < (HEIGHT + hex.height)
            ) {
                // top left (entrance)
                if (hex.x < hex.width && hex.y < hex.height) {
                    //hex.color = "lightblue";
                    hex.isOnRamp = true;

                    if (!entranceHex) {
                        entranceHex = hex;
                    }
                }

                // bottom right (exit)
                else if (hex.x > WIDTH - hex.width && hex.y > HEIGHT - hex.height) {
                    //hex.color = "lightblue";
                    hex.isOffRamp = true;

                    exitHex = hex;
                }

                else if (hex.x < hex.size || hex.x > WIDTH - hex.size || hex.y < hex.size || hex.y > HEIGHT - hex.size) {
                    hex.color = "#bbb";
                    hex.isBorder = true;
                }

                else {
                    hex.isMiddle = true;
                }

                hexes.push(hex);
            }
        });
    });

    // setup exit
    exitHex.isExit = true;

    _.each(hexes, _.method("setupNeighbors", hexes));

    $layers.each(setupCanvas);

    $layers.last().on("mousemove", function (e) {
        console.log(e);
    });

    // draw grid
    _.each(hexes, function (hex, index) {
        hex.draw(layer[0]);
        layer[0].strokeText(index, hex.x - 10, hex.y + 10);
    });


    function debug(i) {
        switch (i) {
            case 1:
                _.each([106, 271, 317, 367, 208, 91, 300], function (index) {
                        hexes[index].structure = true;
                });
                break;
            case 2:
                _.each([60, 77, 94, 111, 71, 67, 104, 105, 69, 73, 58, 56, 55, 88, 90], function (index) {
                        hexes[index].structure = true;
                });
                break;
            case 3:
                _.each(_.range(118, 130).concat(_.range(150, 162)), function (index) {
                        hexes[index].structure = true;
                });
                break;
        }

    }

    game.play = play;
    game.pause = pause;
    game.render = render;
    game.debug = debug;

    // Export global instance.
    window.game = game;

})(this);
