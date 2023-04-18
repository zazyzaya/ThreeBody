const p1_pic = new Image();
const p2_pic = new Image();
const p3_pic = new Image();

const G = 9;
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
    constructor(x, y, m, vx, vy) {
        this.x = x; 
        this.y = y;
        this.m = m;
        this.vx = vx; 
        this.vy = vy; 

        this.pic = new Image();
        this.color = generateColor();
 
        this.bounce_x = 0; 
        this.bounce_y = 0; 
    }

    pixel_trail(ctx) {
      /*
      ctx.fillStyle = `rgb(
        this.rgb[0], this.rgb[1], this.rgb[2]
      )`;
      */
      ctx.beginPath();
      ctx.fillStyle = this.color; 

      var size = 1+parseInt(this.vnorm(this.vx, this.vy)*5);
      ctx.arc(mod(this.x, W), mod(this.y, H), size, 0, 2 * Math.PI, false);
      //ctx.rect(this.x%W, this.y%H, size,size);
      ctx.fill();

      this.prev_x = this.x; 
      this.prev_y = this.y; 
    }
    
    dist(other) {
      return Math.sqrt(
          Math.pow((this.x-other.x), 2) + 
          Math.pow((this.y-other.y), 2)
      ); 
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

    component_momentum(my_v, your_v, my_m, your_m) {
      // my_v' =  (my_m-your_m)              2*your_m
      //           -----------  (my_v) +  ------------- (your_v)
      //          (my_m+your_m)           my_m + your_m 
      //                term 1                  term 2
      var term1 = (my_m - your_m) / (my_m + your_m); 
      term1 = term1 * my_v; 

      var term2 = (2*your_m) / (my_m + your_m);
      term2 = term2 * your_v; 

      return term1 + term2; 
    }


    calc_momentum(other) {
      this.bounce_x = this.component_momentum(
        this.vx, other.vx, 
        this.m, other.m
      ); 
      this.bounce_y = this.component_momentum(
        this.vy, other.vy, 
        this.m, other.m
      );

      other.bounce_x = this.component_momentum(
        other.vx, this.vx, 
        other.m, this.m 
      )
      other.bounce_y = this.component_momentum(
        other.vy, this.vy, 
        other.m, this.m 
      )
    }

    calc_force(other) {
        // Has already been calculated 
        if (this.bounce_x || this.bounce_y) {
          return;
        }

        // M1M2G / d^2 
        var d = this.dist(other);
        var f = (this.m * other.m)*G / Math.pow(d, 2); 
        var theta = this.angle(other); 
    
        // Collision 
        if (d < p_size) {
          this.calc_momentum(other);
          return;
        }

        if (this.x < other.x) {
            this.vx = this.vx + Math.cos(theta)*f; 
            other.vx = other.vx - Math.cos(theta)*f;
        } else {
            this.vx = this.vx - Math.cos(theta)*f; 
            other.vx = other.vx + Math.cos(theta)*f;
        }
    
        if (this.y < other.y) {
            this.vy = this.vy + Math.sin(theta)*f;
            other.vy = other.vy - Math.sin(theta)*f; 
        } else {
            this.vy = this.vy - Math.sin(theta)*f;
            other.vy = other.vy + Math.sin(theta)*f; 
        }
    }

    update() {
      // Need to have velocity at point of impact
      // unchanged to calc for both, so store bounce
      // change in velocity seperate then switch to 0 
      // after they have already ricochetted 
      if (this.bounce_x != 0) {
        this.x = this.x + this.bounce_x;
        this.vx = this.bounce_x; 
        this.bounce_x = 0; 
      }
      else {
        this.x = this.x + this.vx; 
      }

      if (this.bounce_y != 0) {
        this.y = this.y + this.bounce_y; 
        this.vy = this.bounce_y; 
        this.bounce_y = 0;
      } else {
        this.y = this.y + this.vy; 
      }

      /*
      this.x = this.x % W; 
      this.y = this.y % H; 

      if (this.x < 0) {
        this.x = this.x + W; 
      }
      if (this.y < 0) {
        this.y = this.y + H;
      }
      */
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
  var max_dist = mid / 1.05; 

  return mid + rand(max_dist, true); 
}

p1 = new Planet(rand_pos(W), rand_pos(H), 1+rand(2), rand(0.1, true), rand(0.1, true));
p2 = new Planet(rand_pos(W), rand_pos(H), 1+rand(2), rand(0.1, true), rand(0.1, true));
p3 = new Planet(rand_pos(W), rand_pos(H), 1+rand(2), rand(0.1, true), rand(0.1, true));

//var IMG_PIXELS = ctx.getImageData(0,0,W,H);

function set_size(canvas_id) {
  document.getElementById(canvas_id).setAttribute('width', W);
  document.getElementById(canvas_id).setAttribute('height', H);

}

function reset() {
  p1 = new Planet(rand(W), rand(H), 1, rand(0.01, true), rand(0.01, true));
  p2 = new Planet(rand(W), rand(H), 1, rand(0.01, true), rand(0.01, true));
  p3 = new Planet(rand(W), rand(H), 1, rand(0.01, true), rand(0.01, true));

  const pctx = document.getElementById("trace").getContext("2d");
  pctx.clearRect(0,0, W,H);
}

function init() {
  p1.pic.src = "img/canvas_earth.png";
  p2.pic.src = "img/canvas_earth.png";
  p3.pic.src = "img/canvas_earth.png";

  // Cant do this in css for some reason
  set_size("planets");
  set_size("trace");
  
  window.requestAnimationFrame(trace);
  window.requestAnimationFrame(draw_planets);
}

function trace() {
  const pctx = document.getElementById("trace").getContext("2d");
  
  p1.pixel_trail(pctx);
  p2.pixel_trail(pctx);
  p3.pixel_trail(pctx);

  window.requestAnimationFrame(trace);

}

function draw_planet(ctx, p) {
  ctx.translate(mod(p.x, W), mod(p.y, H));
  ctx.drawImage(p.pic, -12, -12); 
  ctx.restore();
  ctx.save();
}

function draw_planets() {
  const ctx = document.getElementById("planets").getContext("2d");

  ctx.clearRect(0, 0, W, H); // clear canvas
  //ctx.putImageData(IMG_PIXELS, 0, 0);  // put traces

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
  ctx.save()

  p1.calc_force(p2); 
  p2.calc_force(p3);
  p3.calc_force(p1);

  p1.update();
  p2.update();
  p3.update();

  window.requestAnimationFrame(draw_planets);
}

init();