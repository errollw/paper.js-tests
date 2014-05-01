// make the paper scope global, by injecting it into window:
paper.install(window);

// keep track of touches
var current_pointers = [];  // pointers currently active on this frame
var prev_pointers = [];     // pointers that registered last frame

// special cases for multi-touch drag/scale/rotate
var multi_touch_start_pts = [];

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

    // bind touch handlers for multi-touch operations
    // see: https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Touch_events
    var canv = document.getElementsByTagName("canvas")[0];
    canv.addEventListener("touchstart",  handle_touch_start,  false);
    canv.addEventListener("touchend",    handle_touch_end,    false);
    canv.addEventListener("touchcancel", handle_touch_cancel, false);
    canv.addEventListener("touchleave",  handle_touch_end,    false);
    canv.addEventListener("touchmove",   handle_touch_move,   false);

    // bind mouse handlers for standard interaction
    canv.addEventListener("mousedown", handle_mouse_down, false);
    canv.addEventListener("mousemove", handle_mouse_move, false);
    canv.addEventListener("mouseup",   handle_mouse_up, false);
    canv.addEventListener("mouseout",  handle_mouse_up, false);
}

function handle_mouse_down(evt) {

    if (current_pointers.length == 0){
        current_pointers[0] = copy_mouse(evt);
        prev_pointers[0] = copy_mouse(evt);
    }
}

function handle_mouse_move(evt) {

    if (current_pointers.length == 1){
        prev_pointers[0] = copy_mouse(current_pointers[0]);
        current_pointers[0] = copy_mouse(evt);

        prev_pt = new Point(prev_pointers[0].pageX, prev_pointers[0].pageY);
        current_pt = new Point(current_pointers[0].pageX, current_pointers[0].pageY);
        var delta = current_pt.subtract(prev_pt);
        raster.position = raster.position.add(delta);
    }
}

function handle_mouse_up(evt) {

    // remove all previous and current touches
    for (var i=0; i < current_pointers.length; i++) {
        if (current_pointers[i].mouse) {
            prev_pointers.splice(i, 1);
            current_pointers.splice(i, 1);
        }
    }
}

function handle_touch_start(evt) {

    evt.preventDefault();
    var touches = evt.changedTouches;
          
    // add new registered touches
    for (var i=0; i < touches.length; i++) {
        current_pointers.push(copyTouch(touches[i]));
        prev_pointers.push(copyTouch(touches[i]));
    }

    // if now multitouching, initialize multitouch transform data
    if (current_pointers.length >= 2) {
        multi_touch_start_pts[0] = copyTouch(current_pointers[0]);
        multi_touch_start_pts[1] = copyTouch(current_pointers[1]);
        raster.multitouch_start_pos = raster.position;
        raster.multitouch_start_rot = raster.rotation;
        raster.mt_start_scaling = raster.scaling;
    }
}

function handle_touch_move(evt) {

    evt.preventDefault();
    var touches = evt.changedTouches;

    for (var i=0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);

        if(idx >= 0) {
            //robutstly set previous touch point before changing the current touch array
            prev_pointers[idx] = current_pointers[idx] ? copyTouch(current_pointers[idx]) : copyTouch(touches[i]);
            current_pointers[idx] = copyTouch(touches[i]);
        } else {
            console.log("can't figure out which touch to continue");
        }
    }

    // if just one touch, move the raster
    if (current_pointers.length == 1) {

        prev_pt_1 = new Point(prev_pointers[0].pageX, prev_pointers[0].pageY);
        touch_pt_1 = new Point(current_pointers[0].pageX, current_pointers[0].pageY);
        var diff = touch_pt_1.subtract(prev_pt_1);
        raster.position = raster.position.add(diff);
    }

    // more complex pan / pinch / rotate operations for two touch points
    if (current_pointers.length == 2) {

        touch_pt_1 = new Point(current_pointers[0].pageX, current_pointers[0].pageY);
        touch_pt_2 = new Point(current_pointers[1].pageX, current_pointers[1].pageY);
        touch_start_pt_1 = new Point(multi_touch_start_pts[0].pageX, multi_touch_start_pts[0].pageY);
        touch_start_pt_2 = new Point(multi_touch_start_pts[1].pageX, multi_touch_start_pts[1].pageY);
        var midpt_touch = touch_pt_1.add(touch_pt_2).divide(2);
        var midpt_touch_starts = touch_start_pt_1.add(touch_start_pt_2).divide(2);

        var vec_touch = touch_pt_1.subtract(touch_pt_2);
        var vec_mt_start = touch_start_pt_1.subtract(touch_start_pt_2);

        // move the raster
        var diff = midpt_touch.subtract(midpt_touch_starts)
        raster.position = raster.multitouch_start_pos.add(diff);

        // rotate the raster
        var d_rot = vec_touch.angle - vec_mt_start.angle;
        raster.rotation = raster.multitouch_start_rot + d_rot;

        // scale the raster
        var d_scale = vec_touch.length / vec_mt_start.length;
        raster.scaling = raster.mt_start_scaling.multiply([d_scale,d_scale]);
    }

}

function handle_touch_end(evt) {

    evt.preventDefault();
    var touches = evt.changedTouches;

    // find the touch that changed, and remove it
    for (var i=0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);

        if(idx >= 0) {
            prev_pointers.splice(idx, 1);
            current_pointers.splice(idx, 1); 
        } else {
            console.log("can't figure out which touch to end");
        }
    }
}

function handle_touch_cancel(evt) {

    evt.preventDefault();
    var touches = evt.changedTouches;

    // remove all previous and current touches
    for (var i=0; i < touches.length; i++) {
      prev_pointers.splice(i, 1);
      current_pointers.splice(i, 1);
    }
}

// some browsers re-use event objects so avoid referencing object
function copyTouch(touch_event) {
    return { identifier: touch_event.identifier, pageX: touch_event.pageX, pageY: touch_event.pageY };
}

function copy_mouse(mouse_evt) {
    return { mouse: true, pageX: mouse_evt.pageX, pageY: mouse_evt.pageY };
}

function ongoingTouchIndexById(idToFind) {
    for (var i=0; i < current_pointers.length; i++) {
      var id = current_pointers[i].identifier;
      
      if (id == idToFind)
        return i;
    }
    return -1;    // not found
}