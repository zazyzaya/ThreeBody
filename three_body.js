const p1_pic = new Image();
const p2_pic = new Image();
const p3_pic = new Image();

const G = 9
const p_size = 12
const W = 1000; 
const H = 1000; 

class Planet {
    constructor(x, y, m, vx, vy) {
        this.x = x; 
        this.y = y;
        this.m = m;
        this.vx = vx; 
        this.vy = vy; 
        this.pic = new Image();

        this.bounce_x = 0; 
        this.bounce_y = 0; 
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

      alert({'x': this.bounce_x, 'y':this.bounce_y});
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
    }
}

p1 = new Planet(300, 150, 1, 0., 0.01);
p2 = new Planet(200, 200, 1, 0.01, 0.);
p3 = new Planet(600, 400, 1, -0.1, 0.);

function init() {
  p1.pic.src = "img/canvas_earth.png";
  p2.pic.src = "img/canvas_earth.png";
  p3.pic.src = "img/canvas_earth.png";
  window.requestAnimationFrame(draw);
}

function draw() {
  const ctx = document.getElementById("canvas").getContext("2d");

  ctx.globalCompositeOperation = "destination-over";
  ctx.clearRect(0, 0, W, H); // clear canvas

  // Default settings
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.strokeStyle = "rgba(0, 153, 255, 0.4)";
  ctx.save();

  // Earth
  //const time = new Date();
  ctx.translate(p1.x%W, p1.y%H);
  ctx.drawImage(p1.pic, -12, -12);
  ctx.restore();
  ctx.save();

  // Moon
  ctx.translate(p2.x%W, p2.y%H);
  ctx.drawImage(p2.pic, -12, -12);
  ctx.restore();
  ctx.save();

  ctx.translate(p3.x%W, p3.y%H);
  ctx.drawImage(p3.pic, -12, -12);
  ctx.restore();
  ctx.save()

  p1.calc_force(p2); 
  p2.calc_force(p3);
  p3.calc_force(p1);

  p1.update();
  p2.update();
  p3.update();

  //calc_force(p1, p3);

  window.requestAnimationFrame(draw);
}

init();