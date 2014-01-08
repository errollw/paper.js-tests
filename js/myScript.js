tool.minDistance = 4;
tool.maxDistance = 100;

var path;

var speed_hist = [0, 0, 0, 0, 0];

function onMouseDown(event) {
	path = new Path();
	path.fillColor = '#00000';
	//path.selected = true;

	path.add(event.point);
}

function onMouseDrag(event) {

	var s = event.delta.length
	s = Math.max(6, s);
	s = Math.min(10, s)
	speed_hist.shift();
	speed_hist.push(s);

	var sum = 0;
	for(var i = 0; i < speed_hist.length; i++){
	    sum += parseInt(speed_hist[i]);
	}

	var avg = sum/speed_hist.length;

	var step = event.delta.normalize(12-avg);
	step.angle += 90;

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
	//path.simplify();
}

Array.prototype.rotate = function( n ) {
  this.unshift.apply( this, this.splice( n, this.length ) )
  return this;
}