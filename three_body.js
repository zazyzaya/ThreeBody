const p1_pic = new Image();
const p2_pic = new Image();
const p3_pic = new Image();

const G = 9
const p_size = 12

let p1 = {
    'x': 150,
    'y': 150,
    'm': 1,
    'vx': -0.01,
    'vy': -1
};

let p2 = {
    'x': 200,
    'y': 200,
    'm': 1,
    'vx': 0.01,
    'vy': -0.01
};

let p3 = {
    'x': 100,
    'y': 100,
    'm': 1,
    'vx': 0.01,
    'vy': -0.01
};

function init() {
  p1_pic.src = "img/canvas_earth.png";
  p2_pic.src = "img/canvas_earth.png";
  p3_pic.src = "img/canvas_earth.png";
  window.requestAnimationFrame(draw);
}

function dist(x,y) {
    return Math.sqrt(
        Math.pow((x.x-y.x), 2) + 
        Math.pow((x.y-y.y), 2)
    ); 
}

function angle(x,y) {
    var dot = x.x*y.x + x.y*y.y; 
    var norm = 
        Math.sqrt(x.x*x.x + x.y*x.y) * 
        Math.sqrt(y.x*y.x + y.y*y.y); 
    
    var cos_theta = dot / norm; 
    return Math.acos(cos_theta); 
}

function calc_force(x,y) {
    // M1M2G / d^2 
    var d = dist(x,y);
    var f = (x.m * y.m)*G / Math.pow(d, 2); 
    var theta = angle(x,y); 

    if (x.x < y.x) {
        x.vx = x.vx + Math.cos(theta)*f; 
        y.vx = y.vx - Math.cos(theta)*f;
    } else {
        x.vx = x.vx - Math.cos(theta)*f; 
        y.vx = y.vx + Math.cos(theta)*f;
    }

    if (x.y < y.y) {
        x.vy = x.vy + Math.sin(theta)*f;
        y.vy = y.vy - Math.sin(theta)*f; 
    } else {
        x.vy = x.vy - Math.sin(theta)*f;
        y.vy = y.vy + Math.sin(theta)*f; 
    }
    
    
}

function draw() {
  const ctx = document.getElementById("canvas").getContext("2d");

  ctx.globalCompositeOperation = "destination-over";
  ctx.clearRect(0, 0, 300, 300); // clear canvas

  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.strokeStyle = "rgba(0, 153, 255, 0.4)";
  ctx.save();

  // Earth
  //const time = new Date();
  ctx.translate(p1.x%300, p1.y%300);
  ctx.drawImage(p1_pic, -12, -12);
  ctx.restore();
  ctx.save();

  // Moon
  ctx.translate(p2.x%300, p2.y%300);
  ctx.drawImage(p2_pic, -12, -12);
  ctx.restore();
  ctx.save();

  ctx.translate(p3.x%300, p3.y%300);
  ctx.drawImage(p3_pic, -12, -12);
  ctx.restore();
  ctx.restore();
  ctx.save()

  p1.x = (p1.x+p1.vx); 
  p2.y = (p2.y+p2.vy); 
  
  calc_force(p1, p2); 
  calc_force(p2, p3);
  calc_force(p1, p3);

  window.requestAnimationFrame(draw);
}

init();