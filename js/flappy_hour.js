// make the paper scope global, by injecting it into window:
paper.install(window);

var vw, vh, ground_y;

var beer_mug,
    bm_dy = 0;

var bg_sky, bg_ground;
var bg_instances = [];

var keg_sets = [],
	keg_set_timer_max = 64;
	keg_set_timer = keg_set_timer_max;

var gap_y, gap_y_min, gap_y_max;

// Only executed our code once the DOM is ready.
window.onload = function() {

    // Create an empty project and a view for the canvas
    paper.setup('flappy_canvas');

    vw = view.size.width, vh = view.size.height;

    ground_y = vh*7/8;
    gap_y_min = 240;
    gap_y_max = ground_y + 240;
    gap_y = Math.ceil(ground_y/2);

    // background rectangle
    bg_sky = new Shape.Rectangle({
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
        beer_mug.rotation = -25;
    }

    view.onFrame = function(event) {

    	keg_set_timer--;
    	if (keg_set_timer == 0){
    		make_keg_set();
    		keg_set_timer = keg_set_timer_max;
    	}

        bm_dy += 0.5;
        beer_mug.position.y += bm_dy;
        beer_mug.position.y = Math.min(vh,beer_mug.position.y)
        beer_mug.rotate(1);

        for(i=0; i<bg_instances.length; i++){
        	bg_instances[i].position.x += bg_instances[i].dx;
        	if(bg_instances[i].position.x < bg_instances[i].thresh_x)
        		bg_instances[i].position.x += bg_instances[i].bounds.width;
        }

        for(i=0; i<keg_sets.length; i++){
        	keg_sets[i].position.x += keg_sets[i].dx;
        }
    }

    make_keg_set();

}

function make_keg_set(){
	beer_keg = new Raster("beer_keg_1.svg");
	beer_keg.scale(0.5);
	beer_keg_sym = new Symbol(beer_keg);

	var keg_set = new Group();

    // make top set of kegs
    for(keg_bottom_y=gap_y-120; keg_bottom_y>0; keg_bottom_y-=120-10){
    	var x_disp = (Math.ceil(Math.random()*4)-2)*2;
    	placed_keg = beer_keg_sym.place([vw+x_disp,keg_bottom_y-60]);
    	keg_set.addChild(placed_keg);
    }

    // make bottom set of kegs
    var lowest_keg_bottom = gap_y+120;
    while (lowest_keg_bottom < vh) lowest_keg_bottom += 110;
    for(keg_bottom_y=lowest_keg_bottom; keg_bottom_y>gap_y+120; keg_bottom_y-=120-10){
    	var x_disp = (Math.ceil(Math.random()*4)-2)*2;
    	placed_keg = beer_keg_sym.place([vw+x_disp,keg_bottom_y-60]);
    	keg_set.addChild(placed_keg);
    }

    keg_set.dx = -4;
    keg_sets.push(keg_set);
    keg_set.insertBelow(bg_ground);

    gap_y += Math.ceil(Math.random()*200-400);
}

function load_background(){

    bg_ground = new Shape.Rectangle({
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
        bg_instance.dx = -4;
        bg_instance.thresh_x = sym_x-ground_scroller.bounds.width;
        bg_instances.push(bg_instance);
    }

}

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};