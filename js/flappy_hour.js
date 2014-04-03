// make the paper scope global, by injecting it into window:
paper.install(window);

var beer_mug,
    bm_dy = 0;

var bg_instances = [];

var vw, vh, ground_y;

// Only executed our code once the DOM is ready.
window.onload = function() {

    // Create an empty project and a view for the canvas
    paper.setup('flappy_canvas');

    vw = view.size.width, vh = view.size.height;

    ground_y = vh*7/8;

    // background rectangle
    var bg_sky = new Shape.Rectangle({
        from: [0, 0], to: [vw, vh],
        fillColor: '#70C6CF'
    });

    beer_mug = new Raster("beer_mug.svg");
    beer_mug.scale(0.5);
    beer_mug.position.y = ground_y/2 - beer_mug.bounds.height;
    beer_mug.position.x = vw/3 - beer_mug.bounds.width/2;

    load_background();

    var tool = new Tool();
    tool.onMouseUp = function(event) {
        bm_dy = -11;
        beer_mug.rotation = -20;
    }

    view.onFrame = function(event) {
        bm_dy += 0.3;
        beer_mug.position.y += bm_dy;
        beer_mug.position.y = Math.min(vh,beer_mug.position.y)
        beer_mug.rotate(1);

        for(i=0; i<bg_instances.length; i++){
            bg_instances[i].position.x += bg_instances[i].dx;
            if(bg_instances[i].position.x <= bg_instances[i].thresh_x)
               bg_instances[i].position.x += bg_instances[i].bounds.width
        }
    }

}

function load_background(){

    var bg_ground = new Shape.Rectangle({
        from: [0, ground_y], to: [vw, vh],
        fillColor: '#DDD994'
    });

    var ground_scroller = new Raster("bg_ground_parallax_scroller.svg");
    ground_scroller.scale(0.5);
    var w = 416/2;
    var sym = new Symbol(ground_scroller);
    var sym_x = 0;
    for(sym_x=-w/2; sym_x<vw+w+w/2; sym_x+=w){
        var bg_instance = sym.place([sym_x,ground_y]);
        bg_instance.dx = -1;
        bg_instance.thresh_x = sym_x-ground_scroller.bounds.width;
        bg_instances.push(bg_instance);
    }

}

function toRad(val) {
    return val * Math.PI / 180;
}