var canvas = document.querySelector('canvas');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
var c = canvas.getContext('2d');

var mouse = {
  x:undefined,
  y:undefined
}

var colorArray = ["#2185C5", "#7ECEFD", "#FFF6E5", "#FF7F66", "#ff1100", "rgb(136, 173, 246)"]

window.addEventListener('mousemove', function(event){
  mouse.x = event.x;
  mouse.y = event.y;
})

window.addEventListener('resize', function(){
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  init();//on changing the screen size, all the stuff should need to be reinitialized
})


function rotate(velocity, angle) {
  const rotatedVelocities = {
      x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
      y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  };

  return rotatedVelocities;
}



function resolveCollision(particle, otherParticle) {
  
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

      // Grab angle between the two colliding particles
      const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

      // Store mass in var for better readability in collision equation
      const m1 = particle.mass;
      const m2 = otherParticle.mass;

      // Velocity before equation
      const u1 = rotate(particle.velocity, angle);
      const u2 = rotate(otherParticle.velocity, angle);

      // Velocity after 1d collision equation
      const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
      const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

      // Final velocity after rotating axis back to original location
      const vFinal1 = rotate(v1, -angle);
      const vFinal2 = rotate(v2, -angle);

      // Swap particle velocities for realistic bounce effect
      particle.velocity.x = vFinal1.x;
      particle.velocity.y = vFinal1.y;

      otherParticle.velocity.x = vFinal2.x;
      otherParticle.velocity.y = vFinal2.y;
  }
}

// Objects
var Ball = function(x, y, radius, color){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.mass = 1;
    this.opacity = 0.1;
    this.velocity = {
      x: randomIntFromRange(-2, 2),
      y: randomIntFromRange(-2, 2)
    }

  this.draw = function(ballArray){
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    c.strokeStyle = this.color;
    c.stroke()
    c.save(); //iske andar till c.restore tk jo hai uski opacity
    c.globalAlpha = this.opacity;
    c.fillStyle = this.color
    c.fill();
    c.restore();
    this.update(ballArray);
  }
  this.update = function(ballArray) {
      if(this.x + this.radius > canvas.width || this.x < this.radius){
          this.velocity.x = -this.velocity.x;
      }
      if(this.y + this.radius > canvas.height || this.y < this.radius){
         this.velocity.y = -this.velocity.y;
      }
      for(let i=0; i<ballArray.length; i++){
        if(ballArray[i] != this){
            if(pythagoras(this.x, this.y, ballArray[i].x, ballArray[i].y) < 2*this.radius){
                resolveCollision(this, ballArray[i]);
            }
        }
      }
      this.x += this.velocity.x;
      this.y += this.velocity.y;
  }
}

function pythagoras(x1, y1, x2, y2){
    let xDis = Math.abs(x1-x2);
    let yDis = Math.abs(y1-y2);
    return Math.sqrt(Math.pow(xDis, 2) + Math.pow(yDis, 2));
}

function randomIntFromRange(mini, maxi){
  return Math.floor((Math.random()*(maxi-mini)) + mini);
}

var ballArray;

function init() {
    ballArray = [];
    for(let i=0; i<200; i++){
        let radius = 25;
        let x = randomIntFromRange(radius, canvas.width-radius);
        let y = randomIntFromRange(radius, canvas.height-radius);
        let color = colorArray[randomIntFromRange(0, colorArray.length-1)]
        for(let j=0; j<ballArray.length; j++){
           if(pythagoras(x, y, ballArray[j].x, ballArray[j].y) < radius*2){
              x = randomIntFromRange(radius, canvas.width-radius);
              y = randomIntFromRange(radius, canvas.height-radius);
              j=-1;
           }
        }
        ballArray.push(new Ball(x,y,radius,color));
    }
}

function animate() {
  requestAnimationFrame(animate)
  c.clearRect(0, 0, canvas.width, canvas.height)
  for(let i=0; i<ballArray.length; i++){
      if(pythagoras(mouse.x, mouse.y, ballArray[i].x, ballArray[i].y) < 200){
        ballArray[i].opacity = 0.8;
      }
      else{
        ballArray[i].opacity = 0.2;
      }
      ballArray[i].draw(ballArray);
  }
}

init()
animate();
//dont recall animate as it is already running even on resizing the screen size;