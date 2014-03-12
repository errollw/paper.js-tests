// make the paper scope global, by injecting it into window:
paper.install(window);

var controlPoints = [];
var movingControlPoint;
var numControlPoints = 12;

var padding = 32;

var isMovingControlPoint;

var controlPointsPath;

var samplingPath, sampledPoint;

var hingePtLeft, hingePtMid, hingePtRight;
var hingePath;
var hingeLength;

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
    samplingPath.dashArray = [10, 4];

    hingeLength = view.size.width / 8;
    hingePtLeft = new Point(view.size.width*3/4 - hingeLength, view.size.height/2)
    hingePtMid = new Point(view.size.width*3/4, view.size.height/2)
    hingePath = new Path();
    hingePoint = new Shape.Circle(hingePtMid, 4);
    hingePoint.fillColor = hingePath.strokeColor = 'dodgerblue';
    hingePath.strokeWidth = 2;

    var ctrlPtGap = (view.size.width/2 - padding*2) / (numControlPoints-1)

    for (i=0; i<numControlPoints; i++) {
        var controlPoint = new Shape.Circle(new Point(padding + i*ctrlPtGap, view.size.height/2), 5);
        controlPoint.strokeColor = 'black';
        controlPoints.push(controlPoint);
    }

    console.log(ctrlPtGap)

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

        var theta = toRad(view.size.height/2 - sampledPoint.position.y);

        var d = hingeLength;
        hingePtRight = new Point( hingePtMid.x + d * Math.cos(theta), hingePtMid.y + d * Math.sin(theta) )

        console.log(hingePtRight);

        hingePath.clear();
        hingePath.add(hingePtLeft);
        hingePath.add(hingePtMid);
        hingePath.add(hingePtRight);
    }

}

function toRad(val) {
    return val * Math.PI / 180;
}