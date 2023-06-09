const p1_pic = new Image();
const p2_pic = new Image();
const p3_pic = new Image();

const G =  6.67e-11
const EARTH = 5.97219e9; // kg
const AU = 3.825e10;        // m
const p_size = 24;
const W = document.getElementById('canvas-container').offsetWidth;
const H = document.getElementById('canvas-container').offsetHeight; 

function generateColor() {
  let hexSet = "0123456789ABCDEF";
  let finalHexString = "#";
  for (let i = 0; i < 6; i++) {
    finalHexString += hexSet[Math.ceil(Math.random() * 15)];
  }
  return finalHexString;
}

// WHY JAVASCRIPT?!?!?
function mod(x,div) {
  var rem = x % div; 
  if (rem < 0) {
    return div+rem; 
  }
  return rem;
}

class Planet {
    constructor(x, y, m, vx, vy, color=null, screen_wrap=false) {
        this.x = x; 
        this.y = y;
        this.m = m;
        this.vx = vx; 
        this.vy = vy; 

        this.pic = new Image();

        if (color == null)
          this.color = generateColor();
        else
          this.color = color; 

        this.wrap = screen_wrap;
    }

    pixel_trail(ctx) {
      /*
      ctx.fillStyle = `rgb(
        this.rgb[0], this.rgb[1], this.rgb[2]
      )`;
      */
      ctx.beginPath();
      ctx.fillStyle = this.color; 

      var size = 1+parseInt(this.vnorm(this.vx, this.vy));
      ctx.arc(mod(this.x, W), mod(this.y, H), size, 0, 2 * Math.PI, false);
      //ctx.rect(this.x%W, this.y%H, size,size);
      ctx.fill();

      this.prev_x = this.x; 
      this.prev_y = this.y; 
    }
    
    wrapped_dist(other) {
      var left, right, up, down;
      if (this.x > other.x) {
        left = other; 
        right = this; 
      } else {
        left = this; 
        right = other; 
      }

      if (this.y > other.y) {
        up = this;
        down = other;
      } else {
        up = other;
        down = this; 
      }

      // Wrap around the screen 
      if (W+left.x - right.x < right.x - left.x ) {
        left.x = W+left.x; 
      }
      if (H+down.y - down.y < up.y - down.y) {
        down.y = H+down.y; 
      }
  
      return Math.max(Math.sqrt(
          Math.pow(right.x - left.x, 2) + 
          Math.pow(up.y - down.y, 2)
      ), p_size); 
    }    

    dist(other) {
      if (this.wrap) return this.wrapped_dist(other);

      return Math.max(Math.sqrt(
        Math.pow(this.x - other.x, 2) + 
        Math.pow(this.y - other.y, 2)
      ), p_size);
    }

    norm() {
      return Math.sqrt(this.x*this.x + this.y*this.y)
    }

    vnorm(x,y) {
      return Math.sqrt(
        x*x + y*y
      )
    }
    
    angle(other) {
        var dot = this.x*other.x + this.y*other.y; 
        var norm = this.norm() * other.norm(); 
        var cos_theta = dot / norm; 
        return Math.acos(cos_theta); 
    }

    calc_force(other) {
        // M1M2G / d^2 
        var d = this.dist(other);
        var f = (this.m*EARTH * other.m*EARTH)*G / (AU*Math.pow(d, 2)); 
        var theta = this.angle(other); 

        if (this.x < other.x) {
            this.vx = this.vx + Math.cos(theta)*f/this.m; 
            other.vx = other.vx - Math.cos(theta)*f/other.m;
        } else { 
            this.vx = this.vx - Math.cos(theta)*f/this.m; 
            other.vx = other.vx + Math.cos(theta)*f/other.m;
        }
    
        if (this.y < other.y) {
            this.vy = this.vy + Math.sin(theta)*f/this.m;
            other.vy = other.vy - Math.sin(theta)*f/other.m; 
        } else {
            this.vy = this.vy - Math.sin(theta)*f/this.m;
            other.vy = other.vy + Math.sin(theta)*f/other.m; 
        }
    }

    update() {
      // Need to have velocity at point of impact
      // unchanged to calc for both, so store bounce
      // change in velocity seperate then switch to 0 
      // after they have already ricochetted 
      this.x = this.x + this.vx; 
      this.y = this.y + this.vy;

      if (this.wrap) {
        this.x = mod(this.x, W); 
        this.y = mod(this.y, H); 
      }
    }
}

function rand(high=1, neg=false){
  if (neg && Math.random() > 0.5){
    return -Math.random()*high
  }
  return Math.random()*high
} 

function rand_pos(axis) {
  var mid = axis / 2; 
  var max_dist = mid / 4; 

  return mid + rand(max_dist, true); 
}

p1 = new Planet(rand_pos(W), rand_pos(H), 2000+rand(250, true), 0,0);
p2 = new Planet(rand_pos(W), rand_pos(H), 2000+rand(250, true), 0,0);
p3 = new Planet(rand_pos(W), rand_pos(H), 2000+rand(250, true), 0,0);

function set_size(canvas_id) {
  document.getElementById(canvas_id).setAttribute('width', W);
  document.getElementById(canvas_id).setAttribute('height', H);
}

function reset() {
  p1 = new Planet(rand_pos(W), rand_pos(H), 1500+rand(250, true), 0,0);
  p2 = new Planet(rand_pos(W), rand_pos(H), 1500+rand(250, true), 0,0);
  p3 = new Planet(rand_pos(W), rand_pos(H), 1500+rand(250, true), 0,0);

  const pctx = document.getElementById("trace").getContext("2d");
  pctx.clearRect(0,0, W,H);

  // Stop old animations
  window.cancelAnimationFrame(t_frame);
  window.cancelAnimationFrame(p_frame);

  init();
}

function clear_trails() {
  const pctx = document.getElementById("trace").getContext("2d");
  pctx.clearRect(0,0, W,H);
}

function save_trails() {
  const pcanvas = document.getElementById("trace");
  var link = document.getElementById('link');
  link.setAttribute('download', 'PlanetTrace.png');
  link.setAttribute('href', pcanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  link.click();
}

function display_info(id, p) {
  var disp_str = 
  "<label>" + id + "</label><br>"
  + "<label>  Init X: </label><input type='text' id='init_x_" + id + "' value='" + p.x + "'><br>"
  + "<label>  Init Y: </label><input type='text' id='init_y_" + id + "' value='" + p.y + "'><br>"
  + "<label>  Init m: </label><input type='text' id='init_m_" + id + "' value='" + p.m + "'><br>"
  + "<label>  Init vx: </label><input type='text' id='init_vx_" + id + "' value='" + p.vx + "'><br>"
  +  "<label>  Init vy: </label><input type='text' id='init_vy_" + id + "' value='" + p.vy + "'><br>"
  + "<label>  Color: </label><input type='color' id='color_" + id + "' value='" + p.color + "'>"; 
  document.getElementById(id).innerHTML = disp_str; 

  document.getElementById('wrap').checked = p.wrap;
  return disp_str; 
}

function load_info(id) {
  var x = parseFloat(document.getElementById('init_x_' + id).value);
  var y = parseFloat(document.getElementById('init_y_' + id).value);
  var m = parseFloat(document.getElementById('init_m_' + id).value);
  var vx = parseFloat(document.getElementById('init_vx_' + id).value);
  var vy = parseFloat(document.getElementById('init_vy_' + id).value);
  var color = document.getElementById('color_' + id).value;
  var wrap = document.getElementById('wrap').checked;
  console.log(x,y,m,vx,vy,color,wrap);

  return new Planet(x, y, m, vx, vy, color, wrap=wrap)
}

function submit() {
  p1 = load_info('p1');
  p2 = load_info('p2'); 
  p3 = load_info('p3');

  // Stop old animations
  window.cancelAnimationFrame(t_frame);
  window.cancelAnimationFrame(p_frame);

  init(); 
}

function init() {
  p1.pic.src = "img/canvas_earth.png";
  p2.pic.src = "img/canvas_earth.png";
  p3.pic.src = "img/canvas_earth.png";

  // Cant do this in css for some reason
  set_size("planets");
  set_size("trace");
  
  display_info('p1', p1);
  display_info('p2', p2);
  display_info('p3', p3);

  window.requestAnimationFrame(trace);
  window.requestAnimationFrame(draw_planets);
}

var t_frame=null;
function trace() {
  const pctx = document.getElementById("trace").getContext("2d");
  
  p1.pixel_trail(pctx);
  p2.pixel_trail(pctx);
  p3.pixel_trail(pctx);

  t_frame = window.requestAnimationFrame(trace);
}

function draw_planet(ctx, p) {
  ctx.translate(mod(p.x, W), mod(p.y, H));
  ctx.drawImage(p.pic, -12, -12); 
  ctx.restore();
  ctx.save();
}

var p_frame = null; 
function draw_planets() {
  const ctx = document.getElementById("planets").getContext("2d");
  ctx.clearRect(0, 0, W, H); // clear canvas

  // Default settings 
  ctx.save();

  // P1
  ctx.translate(mod(p1.x, W), mod(p1.y, H));
  ctx.drawImage(p1.pic, -12, -12); 
  ctx.restore();
  ctx.save();

  // P2
  ctx.translate(mod(p2.x, W), mod(p2.y, H));
  ctx.drawImage(p2.pic, -12, -12);
  ctx.restore();
  ctx.save();

   // P3 
  ctx.translate(mod(p3.x, W), mod(p3.y, H));
  ctx.drawImage(p3.pic, -12, -12);
  ctx.restore();
  ctx.save() // */

  p1.calc_force(p2); 
  p2.calc_force(p3);
  p3.calc_force(p1);

  p1.update();
  p2.update();
  p3.update();

  p_frame = window.requestAnimationFrame(draw_planets);
}

init();