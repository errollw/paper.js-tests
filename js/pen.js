tool.minDistance = 4;
tool.maxDistance = 100;

var path;

var SPEED_MIN = 8,
	SPEED_MAX = 10;
var speed_hist = [0, 0, 0, 0, 0];

var first_drag = true;

function speed_to_thickness(speed){

	speed_hist.shift();
	speed_hist.push(speed);

	var sum = 0;
	for(var i = 0; i < speed_hist.length; i++)
	    sum += parseInt(speed_hist[i]);
	
	return 12-(sum/speed_hist.length);
}

function onMouseDown(event) {
	// start drawing by making a new path

	path = new Path();
	path.fillColor = '#00000';
	path.add(event.point);
}

function onMouseDrag(event) {

	// get the clamped speed that the user is drawing at
	var speed = event.delta.length;
	speed = Math.min(SPEED_MAX, Math.max(SPEED_MIN, speed));
	
	// reset smoothing speed window at the beginning of a stroke
	if (first_drag){
		for(var i = 0; i < speed_hist.length; i++)
		    speed_hist[i] = speed;
		first_drag = false;
	}

	// get thickness to draw at that point
	var thickness = speed_to_thickness(speed);

	// make orthogonal vector to simulate brush thickness
	var step = event.delta.normalize(thickness);
	step.angle += 90;

	// add two points to either side of the drawn point
	var top = event.middlePoint + step;
	var bottom = event.middlePoint - step;
	path.add(top);
	path.insert(0, bottom);

	path.smooth();
}

function onMouseUp(event) {
	path.add(event.point);
	path.closed = true;
	
	path.smooth();
	
	first_drag = true;
}