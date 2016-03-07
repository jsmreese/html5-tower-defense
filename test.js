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
    of a particular class or superClass. The instanceof operator will only
    return true for the instantiated class, not for any superClasses.
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

var Init = createClass();
Init.fn.ii = "Init";
var Circ = createClass(Init, Circle);
var circ3 = new Circ({ radius: 100, blah: "blah" });
