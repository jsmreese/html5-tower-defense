function createClass() {
    var args, func, i;

    args = Array.prototype.slice.call(arguments);

    if (!args.length) { return; }

    func = function (init) {
        var j;

        _.extend(this, init);

        for (j = 0; j < args.length; j += 1) {
            args[j].call(this);
        }

        return this;
    };

    func.prototype = {};

    for (i = 0; i < args.length - 1; i += 1) {
        _.extend(func.prototype, args[i].fn);
    }

    func.fn = func.prototype;

    return func;
}

var Shape = createClass(function () {
    this.shape = "shape";
    this.area = this.x * this.y;
    console.log("Shape");
});

Shape.fn.x = 2;
Shape.fn.y = 4;

var Circle = createClass(Shape, function () {
    this.circle = "circle";
    this.circumference = Math.PI * this.radius;
    console.log("Circle");
});

Circle.fn.radius = 2;

var circ = new Circle({ radius: 1, x: 1, y: 2 })
var circ2 = new Circle();

var Stuff = createClass(function () {
    this.stuff = "stuff";
    console.log("Stuff");
});

Stuff.fn.a = "A";
Stuff.fn.x = 3;

var StuffCircle = createClass(Circle, Stuff, function () {
    this.b = this.a + this.area;
});

function A() {
    this.z = this.a + this.b;

    return this;
}

A.prototype = _.extend({}, {
    a: 1,
    b: 2
});

function B() {
    A.call(this);

    this.y = this.a + this.b + this.c;

    return this;
}

B.prototype = _.extend({}, A.prototype, {
    b: 3,
    c: 4
});



var obj = new B();

console.info(obj.a, obj.b, obj.c, obj.y, obj.z);
