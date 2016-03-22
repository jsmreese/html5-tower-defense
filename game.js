// color scheme http://paletton.com/#uid=63j0u0kw0w0jyC+oRxVy4oIDfjr

//(function (window) {
    var $ = window.jQuery;
    var _ = window._;

    var color = {
        black: "#000",
        background: "#FFF",
        border: "#444",
        grid: "#BBB",
        lineDefault: "#666",
        fillDefault: "#888",
        wall: "#AAA",

        monster: "#4B4"
    };

    /* Color utility functions */

    // rgb2hex
    // Converts an rgb array [r, g, b] to a hex color string "#rrggbb".
    function rgb2hex(rgb) {
        var r, g, b;

        r = Math.round(rgb[0] * 255);
        g = Math.round(rgb[1] * 255);
        b = Math.round(rgb[2] * 255);

        return "#" + (r < 16 ? "0" : "") + r.toString(16) +
           (g < 16 ? "0" : "") + g.toString(16) +
           (b < 16 ? "0" : "") + b.toString(16);
    }

    // hex2rbg
    // Converts a hex color string "#rrggbb" or "#rgb" to an rgb array [r, g, b].
    function hex2rgb(hex) {
        if (hex.length == 7) {
            return [parseInt("0x" + hex.substring(1, 3)) / 255,
                parseInt("0x" + hex.substring(3, 5)) / 255,
                parseInt("0x" + hex.substring(5, 7)) / 255];
        }

        if (hex.length == 4) {
            return [parseInt("0x" + hex.substring(1, 2)) / 15,
                parseInt("0x" + hex.substring(2, 3)) / 15,
                parseInt("0x" + hex.substring(3, 4)) / 15];
        }

        throw "Invalid hex color value.";
    }

    // hsl2rgb
    // Converts an hsl array [h, s, l] to an rgb array [r, g, b].
    function hsl2rgb(hsl) {
        var m1, m2, r, g, b, h, s, l;

        h = hsl[0];
        s = hsl[1];
        l = hsl[2];

        m2 = (l <= 0.5) ? l * (s + 1) : l + s - l * s;
        m1 = l * 2 - m2;

        return [
            hue2rgb(m1, m2, h + 1 / 3),
            hue2rgb(m1, m2, h),
            hue2rgb(m1, m2, h - 1 / 3)
        ];
    }

    // hue2rgb
    // Converts a hue to an rgb array [r, g, b].
    function hue2rgb(m1, m2, h) {
        h = (h < 0) ? h + 1 : ((h > 1) ? h - 1 : h);
        if (h * 6 < 1) { return m1 + (m2 - m1) * h * 6; }
        if (h * 2 < 1) { return m2; }
        if (h * 3 < 2) { return m1 + (m2 - m1) * (2 / 3 - h) * 6; }
        return m1;
    }

    // rgb2hsl
    // Converts an rgb array [r, g, b] to an hsl array [h, s, l].
    function rgb2hsl(rgb) {
        var min, max, delta, h, s, l, r, g, b;

        r = rgb[0];
        g = rgb[1];
        b = rgb[2];

        min = Math.min(r, Math.min(g, b));
        max = Math.max(r, Math.max(g, b));
        delta = max - min;

        l = (min + max) / 2;
        s = 0;

        if (l > 0 && l < 1) {
            s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
        }

        h = 0;

        if (delta > 0) {
            if (max == r && max != g) h += (g - b) / delta;
            if (max == g && max != b) h += (2 + (b - r) / delta);
            if (max == b && max != r) h += (4 + (r - g) / delta);
            h /= 6;
        }

        return [h, s, l];
    }

    // hsl2hex
    // Converts an hsl array [h, s, l] to a hex color value "#rrggbb".
    function hsl2hex(hsl) {
        return rgb2hex(hsl2rgb(hsl));
    }

    // hex2hsl
    // Converts a hex color value "#rrggbb" or "#rgb" to an hsl array [h, s, l].
    function hex2hsl(hex) {
        return rgb2hsl(hex2rgb(hex));
    }

    // darken
    // Darkens a hex color value by the provided factor (0 to 1).
    // e.g. darken(hex, 0.2) will darken a color by reducing its l value by 20%.
    // Default factor is 0.15.
    function darken(hex, factor) {
        var hsl, l;

        factor = factor != null ? factor : 0.15;
        hsl = hex2hsl(hex);
        l = Math.max(hsl[2] - factor, 0);

        return hsl2hex([hsl[0], hsl[1], l]);
    }

    /*
        createClass([superClasses,] constructor)
        Implements classes that allow multiple inheritance.
        Reduces boilerplate of class definition.

        * Automatically calls superClass constructor functions, merges
        superClass prototype properties, and sets up `fn` prototype access.
        * SuperClasses are applied in order, so a superClass appearing later
        in the createClass arguments list will override the properties of a
        previously applied superClass.
        * Constructors do not need to call their superClass constructors.
        * SuperClass constructors are called once per instance, so the class
        constructor at the top of a diamond inheritance pattern will be called
        only once.
        * Use the instanceOf method to determine if an object is an instance
        of a particular class or superClass. The native JavaScript instanceof
        operator will only return true for the instantiated class, not for any
        superClasses.
        * SuperClasses and constructor functions can appear in any order in
        the arguments list passed to createClass. Multiple superClasses and/or
        constructor functions may be specified.
    */
    var createClass = (function () {
        function instanceOf(constructor) {
            return this instanceof constructor || _.indexOf(this.superConstructors, constructor) > -1;
        }

        function createClass() {
            var args, constructor;

            args = Array.prototype.slice.call(arguments);

            constructor = function (init) {
                var j;

                _.extend(this, init);
                this.superConstructors = this.superConstructors || [];

                _.each(args, _.bind(function (arg) {
                    if (_.indexOf(this.superConstructors, arg) == -1) {
                        if (arg.fn && arg.fn.instanceOf) {
                            // Push only superClass constructors defined with createClass.
                            this.superConstructors.push(arg);
                        }

                        arg.call(this);
                    }
                }, this));
            };

            constructor.prototype = _.extend.apply(null, [{}].concat(_.map(args, "fn")));
            constructor.fn = constructor.prototype;
            constructor.fn.instanceOf = instanceOf;

            return constructor;
        }

        return createClass;
    })();

    var Game = createClass(function () {
        _.bindAll(this, "play", "pause", "debug", "render", "setupContext");

        this.$document = $(document);

        this.$layers = this.$document.find("canvas");
        this.$layers.css("border-color", color.border);

        this.$bottom = this.$document.find(".controls-bottom");
        this.$bottom.children().hide();

        this.$side = this.$document.find(".controls-side");
        this.$side.find(".playpause").on("click", _.bind(function (e) {
            if (this.isPaused) {
                this.play();
                return;
            }

            this.pause();
        }, this));

        this.layer = {};

        this.hexes = [];
        this.range = _.range(-20, 20);

        this.monsters = [];
        this.shots = [];
        this.structures = [];

        this.$topLayer = this.$layers.last();

        this.$layers.each(this.setupContext);

        this.$topLayer.on("mousemove", _.bind(_.throttle(function (e) {
            var hex = this.hexFromXY(e.offsetX, e.offsetY);

            this.hoveredHex = null;

            if (hex.isMiddle && !hex.structure) {
                this.hoveredHex = hex;
            }
        }, 10), this));

        this.$topLayer.on("mouseleave", _.bind(function (e) {
            this.hoveredHex = null;
        }, this));

        this.$topLayer.on("click", _.bind(function (e) {
            var structure;

            e.stopPropagation();

            this.clickedMonster = null;
            this.clickedHex = null;

            // clicked on a monster?
            this.clickedMonster = _.find(this.monsters, function (monster) {
                return monster.collisionDetect({
                    x: e.offsetX,
                    y: e.offsetY
                });
            });

            if (this.clickedMonster) {
                this.$bottom.children(":not(.monster)").hide();
                this.$bottom.children(".monster").show();
                return;
            }

            // clicked on a hex?
            this.clickedHex = this.hexFromXY(e.offsetX, e.offsetY);

            if (this.clickedHex) {
                if (this.clickedHex.canBuild()) {
                    structure = new Structure({ game: this, hex: this.clickedHex });
                    this.structures.push(structure);
                    this.clickedHex.structure = structure;
                }

                if (this.clickedHex.structure) {
                    this.$bottom.children(":not(.structure)").hide();
                    this.$bottom.children(".structure").show();
                    return;
                }
            }

            this.$bottom.children().hide();
        }, this));

        this.$document.on("click", _.bind(function (e) {
            this.$topLayer.click();
        }, this));

        this.setupHexes();
    });

    Game.fn.exports = function () {
        return {
            play: this.play,
            pause: this.pause,
            debug: this.debug
        };
    };

    _.extend(Game.fn, {
        height: 465,
        width: 652,
        frameCount: 0,
        isPaused: true
    });

    Game.fn.hexFromXY = function (x, y) {
        var ref, i, j, k;

        ref = this.hexes[0];

        i = 4 / 3 * (x - this.width / 2) / ref.width;
        k = (y - this.height / 2) / ref.height - i / 2;
        j = 0 - i - k;

        return _.find(this.hexes, this.roundIJK(i, j, k));
    };

    Game.fn.roundIJK = function (i, j, k) {
        var ri, rj, rk, di, dj, dk;

        ri = Math.round(i);
        rj = Math.round(j);
        rk = Math.round(k);

        di = Math.abs(ri - i)
        dj = Math.abs(rj - j)
        dk = Math.abs(rk - k)

        if (di > dj && di > dk) {
            ri = 0 - rj - rk;
        }

        else if (dj > dk) {
            rj = 0 - ri - rk
        }

        else {
            rk = 0 - ri -rj;
        }

        return { i: ri, j: rj, k: rk };
    };

    Game.fn.play = function () {
        this.isPaused = false;
        this.render();
    };

    Game.fn.pause = function () {
        this.isPaused = true;
    };

    Game.fn.setupContext = function (index, elem) {
        elem.width = this.width;
        elem.height = this.height;
        this.layer[$(elem).data("layer")] = elem.getContext("2d");
    };

    Game.fn.clearContext = function (context) {
        context.clearRect(0, 0, this.width, this.height);
    };

    Game.fn.render = function () {
        var now;

        this.clearContext(this.layer.structures);
        this.clearContext(this.layer.monsters);
        this.clearContext(this.layer.shots);
        this.clearContext(this.layer.highlights);
        this.clearContext(this.layer.ranges);

        if (this.frameCount % 500 === 0) {
            this.monsters.push(new Monster({ hex: this.entranceHex }));
        }

        this.exitHex.setRoute();

        _.each(this.monsters, _.method("update", this.layer.monsters));
        _.each(this.hexes, _.method("update", this.layer.structures));
        _.each(this.shots, _.method("update", this.layer.shots));

        if (this.clickedMonster) {
            if (this.clickedMonster.health > 0) {
                this.clickedMonster.highlight(this.layer.highlights);
                this.updateControls(this.clickedMonster);
            }

            else {
                this.$topLayer.click();
            }
        }
/*
        if (this.hoveredHex
            && !_.find(this.monsters, { hex: this.hoveredHex })
            && !_.find(this.monsters, { targetHex: this.hoveredHex })) {
            this.hoveredHex.highlight(this.layer[4]);
        }
*/
        if (this.clickedHex) {
            //this.clickedHex.path(this.layer[4]);
            //this.clickedHex.fill(this.layer[4], "green");
            if (this.clickedHex.structure) {
                this.clickedHex.structure.range.draw(this.layer.ranges);
            }

            this.updateControls(this.clickedHex);
        }

        // clean up dead or exited monsters
        this.monsters = _.filter(this.monsters, "hex");

        // clean up shots that were hits or went off-screen
        this.shots = _.filter(this.shots, _.method("isOnScreen", this));

        this.debugLog();

        if (this.frameCount % 60 === 0) {
            now = Date.now();

            console.info("Tick", this.frameCount / 60, 60 / (now - this.lastTickTime) * 1000);

            this.lastTickTime = now;
        }

        this.frameCount += 1;

        !this.isPaused && requestAnimationFrame(this.render);
    };

    Game.fn.updateControls = function (item) {
        if (item instanceof Monster) {
            this.$bottom.children(".monster").find(".position-x").text(item.x.toFixed(2));
            this.$bottom.children(".monster").find(".position-y").text(item.y.toFixed(2));
            this.$bottom.children(".monster").find(".health").text(item.health);
        }

        else if (item instanceof Hex && item.structure) {
            this.$bottom.children(".structure").find(".position-x").text(item.x.toFixed(2));
            this.$bottom.children(".structure").find(".position-y").text(item.y.toFixed(2));
            this.$bottom.children(".structure").find(".position-i").text(item.i);
            this.$bottom.children(".structure").find(".position-j").text(item.j);
            this.$bottom.children(".structure").find(".position-k").text(item.k);
        }
    };

    Game.fn.setupHexes = function () {
        _.each(this.range, _.bind(function (i) {
            _.each(this.range, _.bind(function (j) {
                var hex = new Hex({ i: i, j: j, k: 0 - i - j, game: this });

                if (hex.x > (-hex.width) &&
                    hex.x < (this.width + hex.width) &&
                    hex.y > (-hex.height) &&
                    hex.y < (this.height + hex.height)
                ) {
                    // top left (entrance)
                    if (hex.x < hex.width && hex.y < hex.height) {
                        //hex.color = "lightblue";
                        hex.isOnRamp = true;

                        if (!this.entranceHex) {
                            this.entranceHex = hex;
                        }
                    }

                    // bottom right (exit)
                    else if (hex.x > this.width - hex.width && hex.y > this.height - hex.height) {
                        //hex.color = "lightblue";
                        hex.isOffRamp = true;

                        this.exitHex = hex;
                    }

                    else if (hex.x < hex.size || hex.x > this.width - hex.size || hex.y < hex.size || hex.y > this.height - hex.size) {
                        hex.color = color.border;
                        hex.lineColor = color.border;
                        hex.isBorder = true;
                    }

                    else {
                        hex.isMiddle = true;
                    }

                    this.hexes.push(hex);
                }
            }, this));
        }, this));

        // setup exit
        this.exitHex.isExit = true;

        // setup neighbors
        _.each(this.hexes, _.method("setupNeighbors", this.hexes));

        // draw background
        this.layer.grid.fillStyle = color.background;
        this.layer.grid.fillRect(0, 0, this.width, this.height);

        // draw grid
        _.each(this.hexes, _.bind(function (hex, index) {
            hex.draw(this.layer.grid);

            // DEBUG hex indices
            //this.layer[0].strokeText(index, hex.x - 10, hex.y + 10);
        }, this));
    };

    Game.fn.debug = function (i) {
        switch (i) {
            case 1:
                _.each([106, 271, 317, 367, 208, 91, 300], _.bind(function (index) {
                        this.hexes[index].structure = true;
                }, this));
                break;
            case 2:
                _.each([60, 77, 94, 111, 71, 67, 104, 105, 69, 73, 58, 56, 55, 88, 90], _.bind(function (index) {
                        this.hexes[index].structure = true;
                }, this));
                break;
            case 3:
                _.each(_.range(118, 130).concat(_.range(150, 162)), _.bind(function (index) {
                        this.hexes[index].structure = true;
                }, this));
                break;
        }
    };

    Game.fn.debugLog = function () {
        if (this.frameCount % 300 === 0) {
            console.info("frame", this.frameCount);
            console.log("monsters", this.monsters.length);
            console.log("structures", this.structures.length);
            console.log("shots", this.shots.length);
        }
    };

    Game.fn.processHit = function (obj) {
        obj.shot.isDone = true;

        if (obj.shot.isArea) {
            _.each(obj.monsters, _.method("processHit", obj.shot));
            return;
        }

        obj.monsters[0].processHit(obj.shot);
    };

    var Shape = createClass();

    _.extend(Shape.fn, {
        x: 0,
        vx: 0, // number or function
        ax: 0, // number or function
        y: 0,
        vy: 0, // number or function
        ay: 0 // number or function
    });

    Shape.fn.setHex = function (hex) {
        this.hex = hex;
        this.x = hex.x;
        this.y = hex.y;
    };

    Shape.fn.move = function () {
        this.x += _.result(this, "vx");

        if (!_.isFunction(this.vx)) {
            this.vx += _.result(this, "ax");
        }

        this.y += _.result(this, "vy");

        if (!_.isFunction(this.vy)) {
            this.vy += _.result(this, "ay");
        }

        if (_.isFunction(this.setEndPoint)) {
            this.setEndPoint();
        }
    }

    Shape.fn.fill = function (context, style) {
        context.fillStyle = style;
        context.fill();
    }

    Shape.fn.stroke = function (context, style) {
        context.strokeStyle = style;
        context.stroke();
    }

    Shape.fn.draw = function (context) {
        this.path(context);

        if (this.color) {
            this.fill(context, this.color);
        }

        if (this.lineColor) {
            this.stroke(context, this.lineColor);
        }
    };

    Shape.fn.highlight = function (context) {
        this.path(context);
        this.fill(context, color.background);
    };

    Shape.fn.setUnitVector = function (prop, target) {
        var dx, dy, dv;

        if (target && target.x != null && target.y != null) {
            dx = target.x - this.x;
            dy = target.y - this.y;
            dv = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

            this[prop + "X"] = dx / dv;
            this[prop + "Y"] = dy / dv;
        }
    };

    Shape.fn.isOnScreen = function (game) {
        var hexSize = game.hexes[0].size;
        var width = game.width;
        var height = game.height;

        return !this.isDone
            && this.x > 0 - hexSize
            && this.x < width + hexSize
            && this.y > 0 - hexSize
            && this.y < height + hexSize;
    };

    Shape.fn.toXY = function (prop) {
        return {
            x: this[prop ? prop + "X" : "x"],
            y: this[prop ? prop + "Y" : "y"]
        };
    };

    var Line = createClass(Shape, function () {
        this.setEndPoint();
    });

    _.extend(Line.fn, {
        size: 4,
        lineColor: color.lineDefault,
        vectorX: 1,
        vectorY: 0
    });

    Line.fn.fill = function () {
        // Fill for a line has no meaning.
    };

    Line.fn.path = function (context) {
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.endX, this.endY);
    };

    Line.fn.setEndPoint = function () {
        this.endX = this.x + this.vectorX * this.size;
        this.endY = this.y + this.vectorY * this.size;
    };

    var Circle = createClass(Shape);

    _.extend(Circle.fn, {
        radius: 1,
        color: color.fillDefault
    });

    Circle.fn.path = function (context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        context.closePath();
    };

    Circle.fn.collisionDetect = function (obj) {
        var dx, dy, dr;

        // Early exit for null or undefined x and y.
        if (obj.x == null || obj.y == null) {
            return;
        }

        if (obj.instanceOf && obj.instanceOf(Line)) {
            // Assume that all lines will be relatively short compared to
            // circles. Run collision detection on beginning and end of lines.
            return this.collisionDetect(obj.toXY()) ||
                this.collisionDetect(obj.toXY("end"));
        }

        dx = Math.abs(obj.x - this.x);
        dy = Math.abs(obj.y - this.y);

        dr = this.radius + (obj.radius || 0);

        return dx < dr
            && dy < dr
            && Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(dr, 2);
    };

    var Monster = createClass(Circle, function () {
        if (this.hex) {
            this.setHex(this.hex);
        }
    });

    _.extend(Monster.fn, {
        vh: 0.5,
        health: 4,
        radius: 7,
        color: color.monster
    });

    Monster.fn.move = function () {
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

    Monster.fn.setTargetHex = function (targetHex) {
        this.targetHex = targetHex || this.hex.routeHex;

        if (this.targetHex) {
            this.steps = Math.floor(this.targetHex.size / this.vh);
            this.stepsRemaining = this.steps;
        }
    };

    Monster.fn.update = function (context) {
        this.move();
        this.draw(context);

        if (this.health <= 0) {
            // should be monster.die or something notifying game
            // maybe use isDone = true to filter monsters for removal?
            this.hex = null;
        }

        if (this.hex) {
            if (this.hex.isExit) {
                // should be monster.exit or something notifying game
                this.hex = null;
            }

            else if (!this.targetHex) {
                this.setTargetHex();
            }
        }
    }

    Monster.fn.hasTempRoute = function () {
        var hasRoute = true;

        if (this.hex) {
            hasRoute = hasRoute && this.hex.routeHex;
            hasRoute = hasRoute && this.hex.tempRouteHex;
        }

        if (this.targetHex) {
            hasRoute = hasRoute && this.targetHex.routeHex;
            hasRoute = hasRoute && this.targetHex.tempRouteHex;
        }

        return hasRoute;
    };

    Monster.fn.processHit = function (shot) {
        this.health -= shot.damage;
    };

    var Hex = createClass(Shape, function () {
        this.width = this.size * 2;
        this.height =  Math.sqrt(3) / 2 * this.width;

        this.x = this.game.width / 2 + 3 / 4 * this.width * this.i;
        this.y = this.game.height / 2 + 1 / 2 * this.height * (this.k - this.j);
    });

    _.extend(Hex.fn, {
        i: 0,
        j: 0,
        k: 0,
        size: 20,
        lineColor: color.grid
    });

    Hex.fn.path = function (context) {
        context.beginPath();

        var vertices = _.map([0, 1, 2, 3, 4, 5], this.vertex, this);

        context.moveTo(vertices[0].x, vertices[0].y);

        _.each([1, 2, 3, 4, 5], function (i) {
            context.lineTo(vertices[i].x, vertices[i].y);
        });

        context.closePath();
    };

    Hex.fn.vertex = function (i) {
        var rad = Math.PI / 180 * 60 * i;

        return {
            x: this.x + this.size * Math.cos(rad),
            y: this.y + this.size * Math.sin(rad)
        };
    };

    Hex.fn.clearRoute = function () {
        this.routeHex = null;
    };

    Hex.fn.clearTempRoute = function () {
        this.tempRouteHex = null;
    };

    Hex.fn.setRoute = function (skipHex) {
        var stepHexes = [this];
        var nextStepHexes;

        if (skipHex) {
            _.each(this.game.hexes, _.method("clearTempRoute"));
        }

        else {
            _.each(this.game.hexes, _.method("clearRoute"));
        }

        while (stepHexes.length) {
            nextStepHexes = [];

            _.each(stepHexes, function (stepHex) {
                _.each(stepHex.neighbors, function (hex) {
                    if (!hex.isBorder
                    && !(skipHex ? hex.tempRouteHex : hex.routeHex)
                    && !hex.structure
                    && !hex.isExit
                    && (hex !== skipHex)) {
                        if (skipHex) {
                            hex.tempRouteHex = stepHex;
                        }

                        else {
                            hex.routeHex = stepHex;
                        }

                        nextStepHexes.push(hex);
                    }
                });
            });

            stepHexes = nextStepHexes;
        }
    };

    Hex.fn.update = function (context) {
        // DEBUG routes
        if (this.game.debugRoute) {
            if (this.routeHex) {
                context.beginPath();
                context.moveTo(this.x, this.y);
                context.lineTo(this.routeHex.x, this.routeHex.y);
                context.closePath();

                context.strokeStyle = "rgba(128, 128, 128, 0.4)";
                context.stroke();
            }
        }

        if (this.structure) {
            this.path(context);

            this.fill(context, color.wall);
            this.stroke(context, color.wall);

            this.structure.update(context);
        }
    };

    Hex.fn.canBuild = function () {
        if (this.isMiddle
        && !_.find(this.game.monsters, { hex: this })
        && !_.find(this.game.monsters, { targetHex: this })) {
            this.game.exitHex.setRoute(this);

            if (this.game.entranceHex.tempRouteHex
            && _.every(this.game.monsters, _.method("hasTempRoute"))) {
                return true;
            }
        }

        return false;
    };

    Hex.fn.setupNeighbors = function (hexes) {
        this.neighbors = _.compact(_.reject([
            _.find(hexes, { i: this.i + 1, j: this.j - 1, k: this.k }),
            _.find(hexes, { i: this.i - 1, j: this.j + 1, k: this.k }),
            _.find(hexes, { i: this.i + 1, j: this.j, k: this.k - 1 }),
            _.find(hexes, { i: this.i - 1, j: this.j, k: this.k + 1 }),
            _.find(hexes, { i: this.i, j: this.j + 1, k: this.k - 1 }),
            _.find(hexes, { i: this.i, j: this.j - 1, k: this.k + 1 })
        ], "isBorder"));
    };

    var Shot = createClass(function () {
        this.setVelocity();
    });

    Shot.fn.setVelocity = function () {
        if (this.vectorX != null && this.vectorY != null) {
            if (this.a) {
                this.v += this.a;
            }

            this.vx = this.v * this.vectorX;
            this.vy = this.v * this.vectorY;
        }
    }

    Shot.fn.update = function (context) {
        var hitMonsters;

        this.setUnitVector("targetVector", this.target);

        this.move();

        this.draw(context);

        hitMonsters = _.filter(this.game.monsters, _.bind(function (monster) {
            return monster.collisionDetect(this);
        }, this));

        if (hitMonsters.length) {
            console.warn("HIT", this, hitMonsters);
            this.game.processHit({ shot: this, monsters: hitMonsters });
            return;
        }

        // Nothing hit in this frame.
        if (this.isTracking && this.target && this.target.hex) {
            this.vectorX = this.targetVectorX;
            this.vectorY = this.targetVectorY;
        }

        this.setVelocity();
    };

    var ShotCircle = createClass(Shot, Circle);

    _.extend(ShotCircle.fn, {
        radius: 1.25,
        damage: 1,
        v: 0.5,
        a: 0.05,
        isTracking: true
    });

    var ShotLine = createClass(Shot, Line);

    _.extend(ShotLine.fn, {
        size: 6,
        damage: 1,
        v: 3
    });

    var Structure = createClass(Circle, function () {
        if (this.hex) {
            this.setHex(this.hex);
        }

        this.lineColor = darken(this.color);

        this.range = new Circle({
            x: this.x,
            y: this.y,
            radius: this.rangeRadius,
            color: color.black
        });
    });

    _.extend(Structure.fn, {
        radius: 6.5, // 7.5
        barrelLength: 6, // 5
        rangeRadius: 80,
        color: "#FF7400",
        cooldownFrames: 80,
        cooldownCount: 1, // begin firing one frame after building
        targetVectorX: 1,
        targetVectorY: 0,
        shotRadius: 1.25, // 2.5
        shotType: ShotCircle
    });

    Structure.fn.update = function (context) {
        if (this.cooldownCount) {
            this.cooldownCount -= 1;
        }

        this.target = _.find(this.game.monsters, _.bind(function (monster) {
            return monster.collisionDetect(this.range);
        }, this));

        this.setTargetVector();

        this.draw(context);

        if (this.target && !this.cooldownCount) {
            this.game.shots.push(this.shoot());
            this.cooldownCount = this.cooldownFrames;
        }
    };

    // Unit vector pointing from Structure to its target.
    Structure.fn.setTargetVector = function () {
        this.setUnitVector("targetVector", this.target);
        this.setBarrelPosition();
    };

    Structure.fn.setBarrelPosition = function () {
        var barrelLength;

        barrelLength = this.radius + this.barrelLength;

        this.barrelEndX = this.x + this.targetVectorX * barrelLength;
        this.barrelEndY = this.y + this.targetVectorY * barrelLength;
    };

    Structure.fn.drawBarrel = function (context) {
        context.lineWidth = this.shotRadius * 2;

        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.barrelEndX, this.barrelEndY);
        context.strokeStyle = this.lineColor;
        context.stroke();

        context.lineWidth = 1;
    };

    Structure.fn.draw = function (context) {
        this.drawBarrel(context);

        Circle.fn.draw.call(this, context);
    };

    Structure.fn.shoot = function () {
        return new this.shotType({
            x: this.barrelEndX,
            y: this.barrelEndY,
            vectorX: this.targetVectorX,
            vectorY: this.targetVectorY,
            game: this.game,
            target: this.target,
            radius: this.shotRadius
        });
    };

//    // Export global instance.
    window.game = new Game().exports();
//})(this);
