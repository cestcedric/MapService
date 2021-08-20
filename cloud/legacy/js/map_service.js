// Initialize canvas and context variables
let c;
let ctx;

//Map dimensions
mapX = 600;
mapY = 800;

//array of all robots
let robots = [];
let robotColors = ["#3B568C", "#D91A1A", "#508365", "#ECA414", "#EA8B2E", "#D93CCF"];

//create new robot
function createRobot(ID, xStart, yStart) {
	robots.push({id: ID, xStart: xStart, yStart: yStart, xNew: xStart, yNew: yStart, color: robotColors[robots.length]}); 
}

//create initial map
window.onload = Construct();

function Construct() {
    c = document.getElementById("canvas");
    ctx = c.getContext("2d");
	//start animation
    window.requestAnimationFrame(animationFrame);
}

function moveRobot(ID, xReceived, yReceived) {
	for (var x = 0; x < robots.length; x++) {
		if (robots[x].id == ID) {
			robots[x].xNew = xReceived;
			robots[x].yNew = yReceived;
		}
	}
	//set new destination coordinates for robot
    moveParticles(1);
}

function animationFrame(milliseconds) {
  render();
  //do animation
  window.requestAnimationFrame(animationFrame);
}


function render() {
  setCanvasSize();
  clearCanvas();
  renderParticles();
}

function setCanvasSize() {
  ctx.canvas.width = document.getElementById("container").offsetWidth;
  ctx.canvas.height = document.getElementById("container").offsetHeight;
}

function clearCanvas() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //ctx.drawImage(mapSprite, 0, 0, mapX, mapY);
  ctx.clearRect(0,0, mapX, mapY);
}

function moveParticles(milliseconds) {
	//move for each robot in array
  robots.forEach(function(p) {
    let data = distanceAndAngleBetweenTwoPoints(p.xStart, p.yStart, p.xNew, p.yNew);
	//increase to move robot faster
    let velocity = 200;
    let toMouseVector = new Vector(velocity, data.angle);
    let elapsedSeconds = milliseconds / 1000;

    p.xStart += (toMouseVector.magnitudeX * elapsedSeconds);
    p.yStart += (toMouseVector.magnitudeY * elapsedSeconds);
  });
}

function renderParticles() {
	//render for each robot in array
	robots.forEach(function(p) {
		ctx.save();
		ctx.fillStyle = p.color;
		ctx.fillText(p.id, p.xStart-10, p.yStart-7);
		ctx.beginPath();
		ctx.translate(p.xStart, p.yStart);
		ctx.arc(0, 0, 5, 0, 2 * Math.PI);
		ctx.fillStyle = p.color;
		ctx.fill();
		ctx.restore();
	});
}


//calculate path between 2 points
function distanceAndAngleBetweenTwoPoints(x1, y1, x2, y2) {
  let x = x2 - x1,
    y = y2 - y1;

  return {
    // x^2 + y^2 = r^2
    distance: Math.sqrt(x * x + y * y),
    // convert from radians to degrees
    angle: Math.atan2(y, x) * 180 / Math.PI
  }
}

function Vector(magnitude, angle) {
  let angleRadians = (angle * Math.PI) / 180;
  this.magnitudeX = magnitude * Math.cos(angleRadians);
  this.magnitudeY = magnitude * Math.sin(angleRadians);
}
