// make the paper scope global, by injecting it into window:
paper.install(window);

var controlPoints = [];
var movingControlPoint;

var isMovingControlPoint;

var controlPointsPath;

var samplingPath, sampledPoint;

var hingePt0, hingePt1, hingePt2;
var hingePath;

// Only executed our code once the DOM is ready.
window.onload = function() {

    // Create an empty project and a view for the canvas
    paper.setup('myCanvas');

    var tool = new Tool();

    controlPointsPath = new Path();
    controlPointsPath.strokeColor = 'red';

    var samplingPath = Path.Line(new Point(0,0), new Point(0, view.size.height));
    var sampledPoint = new Shape.Circle(new Point(0,0), 3);
    sampledPoint.fillColor = samplingPath.strokeColor = 'green';

    hingePt0 = new Point(700, 300)
    hingePt1 = new Point(900, 300)
    hingePath = new Path();
    hingePath.strokeColor = 'green';

    for (i=0; i<10; i++) {
        var controlPoint = new Shape.Circle(new Point(50 + i*50, 300), 5);
        controlPoint.strokeColor = 'black';
        controlPoints.push(controlPoint);
    }

    tool.onMouseDown = function(event) {

        var hit_options = { tolerance: 10 };
        var hit_result = project.hitTest(event.point, hit_options);

        if (!hit_result) return;

        isMovingControlPoint = true;
        movingControlPoint = hit_result.item;
    }

    tool.onMouseMove = function(event) {
        if (isMovingControlPoint) {
            movingControlPoint.position = new Point(movingControlPoint.position.x, event.point.y);
        }
    }

    tool.onMouseUp = function(event) {
        isMovingControlPoint = false;
    }


    view.onFrame = function(event) {

        controlPointsPath.clear();

        for (i=0; i<controlPoints.length; i++){
            controlPointsPath.add(controlPoints[i].position);
        }
        controlPointsPath.smooth();

        samplingPath.position.x += 1;
        
        samplingPath.position.x = Math.max(samplingPath.position.x, controlPoints[0].position.x);
        if (samplingPath.position.x > controlPoints[controlPoints.length-1].position.x)
            samplingPath.position.x = controlPoints[0].position.x;

        var intersections = samplingPath.getIntersections(controlPointsPath);

        if (intersections.length == 0) return

        sampledPoint.setPosition(intersections[0].point);
        console.log(sampledPoint.position)

        var theta = toRad(sampledPoint.position.y);

        var d = 200;
        hingePt2 = new Point( hingePt1.x + d * Math.cos(theta), hingePt1.y + d * Math.sin(theta) )

        console.log(hingePt2);

        hingePath.clear();
        hingePath.add(hingePt0);
        hingePath.add(hingePt1);
        hingePath.add(hingePt2);
    }

}

function toRad(val) {
    return val * Math.PI / 180;
}