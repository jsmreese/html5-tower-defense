// color scheme http://paletton.com/#uid=63j0u0kw0w0jyC+oRxVy4oIDfjr

(function (window) {
    var $ = window.jQuery;
    var _ = window._;

    function Game(init) {
        _.extend(this, this.defaults, init);
        _.bindAll(this, "play", "pause", "debug", "render", "setupContext");

        this.$document = $(document);
        this.$layers = this.$document.find("canvas");
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

        return this;
    }

    Game.prototype.exports = function () {
        return {
            play: this.play,
            pause: this.pause,
            debug: this.debug
        };
    };

    Game.prototype.defaults = {
        height: 465,
        width: 652,
        frameCount: 0,
        isPaused: true
    };

    Game.prototype.hexFromXY = function (x, y) {
        var ref, i, j, k;

        ref = this.hexes[0];

        i = 4 / 3 * (x - this.width / 2) / ref.width;
        k = (y - this.height / 2) / ref.height - i / 2;
        j = 0 - i - k;

        return _.find(this.hexes, this.roundIJK(i, j, k));
    };

    Game.prototype.roundIJK = function (i, j, k) {
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

    Game.prototype.play = function () {
        this.isPaused = false;
        this.render();
    };

    Game.prototype.pause = function () {
        this.isPaused = true;
    };

    Game.prototype.setupContext = function (index, elem) {
        elem.width = this.width;
        elem.height = this.height;
        this.layer[$(elem).data("layer")] = elem.getContext("2d");
    };

    Game.prototype.clearContext = function (context) {
        context.clearRect(0, 0, this.width, this.height);
    };

    Game.prototype.render = function () {
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

        // clean up off-screen shots
        this.shots = _.filter(this.shots, _.method("isOnScreen", this));

        this.debugLog();

        this.frameCount += 1;

        !this.isPaused && requestAnimationFrame(this.render);
    };

    Game.prototype.updateControls = function (item) {
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

    Game.prototype.setupHexes = function () {
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
                        hex.color = "#00595e";
                        hex.lineColor = "#00595e";
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

        // draw grid
        _.each(this.hexes, _.bind(function (hex, index) {
            hex.draw(this.layer.grid);

            // DEBUG
            //this.layer[0].strokeText(index, hex.x - 10, hex.y + 10);
        }, this));
    };

    Game.prototype.debug = function (i) {
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

    Game.prototype.debugLog = function () {
        if (this.frameCount % 300 === 0) {
            console.info("frame", this.frameCount);
            console.log("monsters", this.monsters.length);
            console.log("structures", this.structures.length);
            console.log("shots", this.shots.length);
        }
    };

    Game.prototype.processHit = function (obj) {
        var firstMonster = obj.monsters[0];
        var damage = obj.shot.damage;

        firstMonster.health -= damage;

        this.shots = _.reject(this.shots, obj.shot);
    };


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

    Shape.prototype.setHex = function (hex) {
        this.hex = hex;
        this.x = hex.x;
        this.y = hex.y;
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

        if (_.isFunction(this.setEndPoint)) {
            this.setEndPoint();
        }
    }

    Shape.prototype.fill = function (context, style) {
        context.fillStyle = style;
        context.fill();
    }

    Shape.prototype.stroke = function (context, style) {
        context.strokeStyle = style;
        context.stroke();
    }

    Shape.prototype.draw = function (context) {
        this.path(context);

        if (this.color) {
            this.fill(context, this.color);
        }

        if (this.lineColor) {
            this.stroke(context, this.lineColor);
        }
    };

    Shape.prototype.highlight = function (context) {
        this.path(context);
        this.fill(context, "#fff");
    };

    Shape.prototype.setUnitVector = function (propName, target) {
        var dx, dy, dv;

        if (target && target.x != null && target.y != null) {
            dx = target.x - this.x;
            dy = target.y - this.y;
            dv = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

            this[propName + "X"] = dx / dv;
            this[propName + "Y"] = dy / dv;
        }
    };

    Shape.prototype.isOnScreen = function (game) {
        var hexSize = game.hexes[0].size;
        var width = game.width;
        var height = game.height;

        return this.x > 0 - hexSize
            && this.x < width + hexSize
            && this.y > 0 - hexSize
            && this.y < height + hexSize;
    };

    function Line(init) {
        _.extend(this, this.defaults, init);

        this.setEndPoint();

        return this;
    }

    Line.prototype = new Shape();
    Line.prototype.defaults = _.extend({}, Line.prototype.defaults, {
        size: 4,
        lineColor: "#000",
        vectorX: 1,
        vectorY: 0
    });

    Line.prototype.fill = function () {
        // Fill for a line has no meaning.
    };

    Line.prototype.path = function (context) {
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.endX, this.endY);
    };

    Line.prototype.setEndPoint = function () {
        this.endX = this.x + this.vectorX * this.size;
        this.endY = this.y + this.vectorY * this.size;
    };

    function Circle(init) {
        _.extend(this, this.defaults, init);
        return this;
    };

    Circle.prototype = new Shape();
    Circle.prototype.defaults = _.extend({}, Circle.prototype.defaults, {
        radius: 1,
        color: "#000"
    });

    Circle.prototype.path = function (context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        context.closePath();
    };

    Circle.prototype.collisionDetect = function (obj) {
        var dx, dy, dr;

        // Early exit for null or undefined x and y.
        if (obj.x == null || obj.y == null) {
            return;
        }

        if (obj.endX != null && obj.endY != null) {
            return this.collisionDetect({ x: obj.x, y: obj.y }) ||
                this.collisionDetect({ x: obj.endX, y: obj.endY });
        }

        dx = Math.abs(obj.x - this.x);
        dy = Math.abs(obj.y - this.y);

        dr = this.radius + (obj.radius || 0);

        return dx < dr
            && dy < dr
            && Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(dr, 2);
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
        vh: 0.2,
        health: 4,
        radius: 7,
        color: "#00C90D"
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

    Monster.prototype.update = function (context) {
        this.move();
        this.draw(context);

        if (this.health <= 0) {
            this.hex = null;
        }

        if (this.hex) {
            if (this.hex.isExit) {
                this.hex = null;
            }

            else if (!this.targetHex) {
                this.setTargetHex();
            }
        }
    }

    Monster.prototype.hasTempRoute = function () {
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

    function Hex(init) {
        _.extend(this, this.defaults, init);

        this.width = this.size * 2;
        this.height =  Math.sqrt(3) / 2 * this.width;

        this.x = this.game.width / 2 + 3 / 4 * this.width * this.i;
        this.y = this.game.height / 2 + 1 / 2 * this.height * (this.k - this.j);

        return this;
    };

    Hex.prototype = new Shape();
    Hex.prototype.defaults = _.extend({}, Hex.prototype.defaults, {
        i: 0,
        j: 0,
        k: 0,
        size: 20,
        lineColor: "#017277"
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

    Hex.prototype.clearTempRoute = function () {
        this.tempRouteHex = null;
    };

    Hex.prototype.setRoute = function (skipHex) {
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

    Hex.prototype.update = function (context) {
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

            this.fill(context, "#46B2B2");
            this.stroke(context, this.lineColor);

            this.structure.update(context);
        }
    };

    Hex.prototype.canBuild = function () {
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

    function Structure(init) {
        _.extend(this, this.defaults, init);

        this.shotType = ShotLine;

        if (this.hex) {
            this.setHex(this.hex);
        }

        this.range = new Circle({
            x: this.x,
            y: this.y,
            radius: this.rangeRadius,
            color: "#000"
        });

        return this;
    };

    Structure.prototype = new Circle();
    Structure.prototype.defaults = {
        radius: 7,
        barrelLength: 5,
        rangeRadius: 40,
        color: "#FF7400",
        lineColor: "#9B4600",
        cooldownFrames: 80,
        cooldownCount: 1, // begin firing one frame after building
        targetVectorX: 1,
        targetVectorY: 0,
        shotRadius: 1.25
    };

    Structure.prototype.update = function (context) {
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
    Structure.prototype.setTargetVector = function () {
        var barrelLength;

        this.setUnitVector("targetVector", this.target);

        barrelLength = this.radius + this.barrelLength;

        this.barrelEndX = this.x + this.targetVectorX * barrelLength;
        this.barrelEndY = this.y + this.targetVectorY * barrelLength;
    };

    Structure.prototype.drawBarrel = function (context) {
        context.lineWidth = this.shotRadius * 2;

        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.barrelEndX, this.barrelEndY);
        context.strokeStyle = this.lineColor;
        context.stroke();

        context.lineWidth = 1;
    };

    Structure.prototype.draw = function (context) {
        this.drawBarrel(context);

        Circle.prototype.draw.call(this, context);
    };

    Structure.prototype.shoot = function () {
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

    // Shot mixin object used for fake multiple inheritance
    var Shot = {};

    Shot.setVelocity = function () {
        if (this.vectorX != null && this.vectorY != null) {
            this.vx = this.v * this.vectorX;
            this.vy = this.v * this.vectorY;
        }
    }

    Shot.update = function (context) {
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
        }
    };

    function ShotCircle(init) {
        _.extend(this, this.defaults, init);

        this.setVelocity();

        return this;
    };

    ShotCircle.prototype = new Circle();
    _.extend(ShotCircle.prototype, Shot);
    ShotCircle.prototype.defaults = {
        radius: 1,
        color: "hsla(183, 100%, 9%, 1)",
        damage: 1,
        v: 2
    };

    function ShotLine(init) {
        _.extend(this, this.defaults, init);

        this.setVelocity();

        return this;	
    };

    ShotLine.prototype = new Line();
    _.extend(ShotLine.prototype, Shot);
    ShotLine.prototype.defaults = {
        size: 4,
        color: "#1A60FF",
        damage: 1,
        v: 3
    };

    // Export global instance.
    window.game = new Game().exports();
})(this);
