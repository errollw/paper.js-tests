// make the paper scope global, by injecting it into window:
paper.install(window);

// keep track of touches
var currentTouches = [];  // touches currently active on this frame
var previousTouches = []; // touches that registered last frame

// the image to move
var raster;

// Only executed our code once the DOM is ready.
window.onload = function() {

    // Create an empty project and a view for the canvas
    var canvas = document.getElementById('myCanvas');
    paper.setup(canvas);

    // Create a test raster image
    raster = new Raster('peppers.jpg');
    raster.position = view.center;

    // Bind touch handlers for multi-touch operations
    // see: https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Touch_events
    var canv = document.getElementsByTagName("canvas")[0];
    canv.addEventListener("touchstart",  handleStart,  false);
    canv.addEventListener("touchend",    handleEnd,    false);
    canv.addEventListener("touchcancel", handleCancel, false);
    canv.addEventListener("touchleave",  handleEnd,    false);
    canv.addEventListener("touchmove",   handleMove,   false);
}

// for handling clicks as well as touches
function onTouch(evt) {
  evt.preventDefault();
  if (evt.touches.length > 1 || (evt.type == "touchend" && evt.touches.length > 0))
    return;

  var newEvt = document.createEvent("MouseEvents");
  var type = null;
  var touch = null;
  switch (evt.type) {
    case "touchstart":    type = "mousedown";    touch = evt.changedTouches[0];break;
    case "touchmove":        type = "mousemove";    touch = evt.changedTouches[0];break;
    case "touchend":        type = "mouseup";    touch = evt.changedTouches[0];break;
  }
  
  newEvt.initMouseEvent(type, true, true, evt.originalTarget.ownerDocument.defaultView, 0,
    touch.screenX, touch.screenY, touch.clientX, touch.clientY,
    evt.ctrlKey, evt.altKey, evt.shiftKey, evt.metaKey, 0, null);
  evt.originalTarget.dispatchEvent(newEvt);
}

function handleStart(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;
          
    for (var i=0; i < touches.length; i++) {
        currentTouches.push(copyTouch(touches[i]));
        previousTouches.push(copyTouch(touches[i]));
    }
}

function handleMove(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;

    for (var i=0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);

        if(idx >= 0) {
            //robutstly set previous touch point before changing the current touch array
            previousTouches[idx] = currentTouches[idx] ? copyTouch(currentTouches[idx]) : copyTouch(touches[i]);
            currentTouches[idx] = copyTouch(touches[i]);
        } else {
            console.log("can't figure out which touch to continue");
        }
    }

    // if just one touch, move the raster
    if (currentTouches.length == 1) {

        prev_pt_1 = new Point(previousTouches[0].pageX, previousTouches[0].pageY);
        touch_pt_1 = new Point(currentTouches[0].pageX, currentTouches[0].pageY);
        var diff = touch_pt_1.subtract(prev_pt_1);
        raster.position = raster.position.add(diff);
    }

    // more complex pan / pinch / rotate operations for two touch points
    if (currentTouches.length == 2) {

        prev_pt_1 = new Point(previousTouches[0].pageX, previousTouches[0].pageY);
        prev_pt_2 = new Point(previousTouches[1].pageX, previousTouches[1].pageY);
        touch_pt_1 = new Point(currentTouches[0].pageX, currentTouches[0].pageY);
        touch_pt_2 = new Point(currentTouches[1].pageX, currentTouches[1].pageY);
        var midpt_touch = touch_pt_1.add(touch_pt_2).divide(2);

        // vectors between old touch points and new touch points
        var vec_prev = prev_pt_1.subtract(prev_pt_2);
        var vec_new = touch_pt_1.subtract(touch_pt_2);

        // move the raster
        var v1 = touch_pt_1.subtract(prev_pt_1);
        var v2 = touch_pt_2.subtract(prev_pt_2);
        var diff = v1.add(v2).divide(2);
        raster.position = raster.position.add(diff);

        // scale the raster
        var d_scale = vec_new.length / vec_prev.length;
        raster.scale(d_scale, midpt_touch);

        // rotate the raster
        var d_rot = vec_new.angle - vec_prev.angle;
        raster.rotate(d_rot,  midpt_touch);
    }

}

function handleEnd(evt) {
    evt.preventDefault();
    console.log("touchend/touchleave.");
    var touches = evt.changedTouches;

    // find the touch that changed, and remove it
    for (var i=0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);

        if(idx >= 0) {
            previousTouches.splice(idx, 1);
            currentTouches.splice(idx, 1); 
        } else {
            console.log("can't figure out which touch to end");
        }
    }
}

function handleCancel(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;

    // remove all previous and current touches
    for (var i=0; i < touches.length; i++) {
      previousTouches.splice(i, 1);
      currentTouches.splice(i, 1);
    }
}

// some browsers re-use touch objects so avoid referencing object
function copyTouch(touch) {
    return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}

function ongoingTouchIndexById(idToFind) {
    for (var i=0; i < currentTouches.length; i++) {
      var id = currentTouches[i].identifier;
      
      if (id == idToFind)
        return i;
    }
    return -1;    // not found
}