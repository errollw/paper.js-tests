// make the paper scope global, by injecting it into window:
paper.install(window);

var vh, vw;
var padding = 32;

// our spline interpolates these control points
var numControlPoints = 12;
var controlPoints = [], controlPointsPath;
var isMovingControlPoint, movingControlPoint;

// we manually sample y-values along the spline
var samplingPath, sampledPoint;
var samplingSpeed = 1;

// we animate a simple hinge
var hingeLength;
var hingePath;

// only executed our code once the DOM is ready.
window.onload = function() {

    // create an empty project and a view for the canvas
    paper.setup('myCanvas');

    vh = view.size.height, vw = view.size.width;

    // handles our mouse events
    var tool = new Tool();

    // simple guides behind spline
    baselinePath = new Path.Line(new Point(padding, vh/2), new Point(vw/2-padding, vh/2));
    maxPath = new Path.Line(new Point(padding, vh/2 + vh/3), new Point(vw/2-padding, vh/2 + vh/3));
    minPath = new Path.Line(new Point(padding, vh/2 - vh/3), new Point(vw/2-padding, vh/2 - vh/3));
    maxPath.strokeColor = minPath.strokeColor = baselinePath.strokeColor = 'lightgrey';
    baselinePath.dashArray = maxPath.dashArray = minPath.dashArray = [5, 5];

    // spline between control points
    controlPointsPath = new Path();
    controlPointsPath.strokeColor = 'red';

    // we move this path and calculate intersection with spline to get y-value
    var samplingPath = Path.Line(new Point(0,0), new Point(0, vh));
    var sampledPoint = new Shape.Circle(new Point(0,0), 3);
    sampledPoint.fillColor = samplingPath.strokeColor = 'green';
    samplingPath.dashArray = [10, 4];

    // initialize hinge
    hingeLength = vw / 8;
    hingePath = new Path([
        new Point(vw*3/4 - hingeLength, vh/2),
        new Point(vw*3/4, vh/2),
        new Point(0, 0)
    ]);
    hingePoint = new Shape.Circle(hingePath.segments[1].point, 4);
    hingePoint.fillColor = hingePath.strokeColor = 'dodgerblue';
    hingePath.strokeWidth = 2;

    // actually add the control points
    var ctrlPtGap = (vw/2 - padding*2) / (numControlPoints-1)
    for (i=0; i<numControlPoints; i++) {
        var controlPoint = new Shape.Circle(new Point(padding + i*ctrlPtGap, vh/2), 5);
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

        // redraw the control points spline
        controlPointsPath.clear();
        for (i=0; i<controlPoints.length; i++){
            controlPointsPath.add(controlPoints[i].position);
        }
        controlPointsPath.smooth();

        // move the sampling path (reset it at the end of spline)
        samplingPath.position.x += samplingSpeed;
        samplingPath.position.x = Math.max(samplingPath.position.x, controlPoints[0].position.x);
        if (samplingPath.position.x > controlPoints[controlPoints.length-1].position.x){
            samplingPath.position.x = controlPoints[0].position.x;
        }

        var intersections = samplingPath.getIntersections(controlPointsPath);

        if (intersections.length == 0) return   // terminate for no intersections

        sampledPoint.setPosition(intersections[0].point);

        var theta = getTheta(sampledPoint.position.y);

        // set position of final hinge limb
        hingePath.segments[2].point = new Point(
            hingePath.segments[1].point.x + hingeLength * Math.cos(theta),
            hingePath.segments[1].point.y + hingeLength * Math.sin(theta) )
    }

    // control handlers
    var btnSpeedUp = document.getElementById('btnSpeedUp');
    var btnSpeedDown = document.getElementById('btnSpeedDown');
    btnSpeedUp.addEventListener("mouseup",  function(){samplingSpeed += 1},  false);
    btnSpeedDown.addEventListener("mouseup",  function(){samplingSpeed -= 1},  false);

}

function getTheta(val) {
    var diffFromMid = val - vh/2;
    var scaledDiff = (diffFromMid / (vh/3))*180
    return scaledDiff * Math.PI / 180;
}