let video;
let poseNet;
let poses;

//posenet
var prevx;
var prevy;
var x;
var y;
var flapstate = false;
var flapvelocity;

//game
var dino;
var obstacles = [];
var obstaclespacing = 60;
var obstaclespeed = 6;
//0 = stopped, 1=playing
var gameState = 0;
var highscore = 0;

//images
let dinoImg;
let myFont;

//https://www.urbanfonts.com/fonts/8-bit_pusab.font

function preload() {
  // dinoImg = loadImage('assets/dino0000.png');
  myFont = loadFont('assets/8-bitpusab.ttf');
  backgroundimg = loadImage('assets/Sprite-0002.jpg');
}

function setup() {
  createCanvas(window.innerWidth,window.innerHeight);

  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function (results) {
  poses = results;
  });

  dino = new Dino();
  obstacles.push(new Obstacle());
}

function modelReady() {
  console.log("Model Ready!");
}

function draw() {
  // filter(GRAY);
  background(255);
  // image(backgroundimg, 0, 0, window.innerWidth, window.innerHeight - 100);
  playGame();
  // draw ground
  translate(width,0);
  scale(-1.0,1.0);
  image(video, window.innerWidth - 320, 0);
  //draw ground
  // console.log(window.innerWidth);
  fill(0);
  rect(0,window.innerHeight - 100,window.innerWidth,window.innerHeight - 100);
  // tint(255, 255);
  calculatePoses();
}

function calculatePoses(){
  if (poses != undefined ) {
    //iterate through number of poses
    for (let i = 0; i < poses.length; i++) {
      for (let j=0; j< poses[i].pose.keypoints.length; j++) {
        let partname = poses[i].pose.keypoints[j].part;
        let score = poses[i].pose.keypoints[j].score;

        if (score > 0.5 & partname == "nose") {
          prevx = x;
          prevy = y;
          x = poses[i].pose.keypoints[j].position.x;
          y = poses[i].pose.keypoints[j].position.y;
          flapvelocity = (prevy - y) / 2
          // console.log(velocity);
          if(flapvelocity > 4 & flapstate){
            console.log("Jump Detected");
            dino.up();
            flapstate = false;
            if(gameState == 0){
              gameState = 1;
              gameReset();
            }
          }
          if(flapvelocity < -3){
            dino.down();
            flapstate = true;
          }
          noStroke();
          fill(0,255,0);
          ellipse(window.innerWidth - (320 - x),y,5,5);
        }
      }
    }
  }
}

function playGame(){
  if(gameState == 0){
    fill('#000000');
    textFont(myFont);
    textSize(16);
    text("Press Space or Jump to Start", (window.innerWidth / 2) - (150), window.innerHeight / 2);
  }
  if(gameState == 1){
    for (var i = obstacles.length-1; i >= 0; i--) {
      obstacles[i].show();
      obstacles[i].update();
      if (obstacles[i].hits(dino)) {
        console.log("Game Over");
        dino.gameOver();
        gameState = 0;
      }

      if (obstacles[i].offscreen()) {
        obstacles.splice(i, 1);
      }
    }

    dino.update();
    dino.show();
    // pipespacing = Math.random() * 10
    // console.log(pipespacing);
    if (frameCount % 100 == 0 && frameCount % 500 != 0) {
      obstacles.push(new Obstacle(getRandomInt(3),obstaclespeed));
    }
    //variable difficulty
    if(dino.score > 0 && dino.score % 500 == 0){
      obstaclespeed += 1;
    }
  }
}

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function gameReset(){
  dino = new Dino();
  // dino.score = 0;
  obstacles = [];
  obstaclespacing = 60;
  obstaclespeed = 6;
  obstaclecount = 0;
}

function keyPressed() {
  if (key == ' ' || key == "w") {
    dino.up();
    if(gameState == 0){
      gameState = 1;
      gameReset();
    }
  }
  if (key == 's') {
    dino.down();
    //console.log("SPACE");
  }
}
