function createClass() {
    function instanceOf(ctor) {
        return this instanceof ctor || _.indexOf(this.constructors, ctor) > -1;
    }

    var args, func, i;

    args = Array.prototype.slice.call(arguments);

    if (!args.length) { return; }

    func = function (init) {
        var j;

        _.extend(this, init);
        this.constructors = this.constructors || [];

        _.each(args, _.bind(function (arg) {
            if (_.indexOf(this.constructors, arg) == -1) {
                this.constructors.push(arg);
                arg.call(this);
            }
        }, this));

        return this;
    };

    func.prototype = _.extend.apply(null, [{}].concat(_.map(args, "fn")));
    func.fn = func.prototype;
    func.fn.instanceOf = instanceOf;

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

//var circ = new Circle({ radius: 1, x: 1, y: 2 })
//var circ2 = new Circle();

var Stuff = createClass(Shape, function () {
    this.stuff = "stuff";
    console.log("Stuff");
});

Stuff.fn.a = "A";
Stuff.fn.x = 3;

var StuffCircle = createClass(Circle, Stuff, function () {
    this.b = this.a + this.area;
    console.log("StuffCircle");
});

var st1 = new StuffCircle();

console.log(st1.instanceOf(StuffCircle));
console.log(st1.instanceOf(Circle));
console.log(st1.instanceOf(Stuff));
console.log(st1.instanceOf(Shape));
