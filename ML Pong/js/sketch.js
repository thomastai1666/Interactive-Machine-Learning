let video;
let poseNet;
let poses;

let leftscore = 0;
let rightscore = 0;

var ballY;
var ballX;

var ready = false;
var state = 0;

// Pong Code Credit
// https: //youtu.be/IIrC5Qcb2G4
// Use web server or XMHTTP Error will occur in Chrome

//Music and Sound Credit
// Game Music: https://www.youtube.com/watch?v=DHcwd_tBVDM
// Start Sound: https://freesound.org/people/GameAudio/sounds/220173/

function preload() {
  //custom font
  font = loadFont('assets/8-BIT-WONDER.TTF');
  music = loadSound('assets/Mystical_Pixels.mp3');
  start = loadSound('assets/start.wav');
  ding = loadSound("assets/ding.mp3");
  bounce = loadSound("assets/bounce.wav");
}

function setup() {
  createCanvas(600,400);

  //loading screen
  puck = new Puck();
  left = new Paddle(true);
  right = new ComputerPaddle(false);

  //1 player
  menupuck = new Puck();
  menuleft = new ComputerPaddle(true);
  menuright = new ComputerPaddle(false);

  //2 player
  multipuck = new Puck();
  multileft = new Paddle(true);
  multiright = new Paddle(false);

  video = createCapture(VIDEO);
  video.size(600, 400);
  video.hide();

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function (results) {
    poses = results;
  });
}


function draw() {
  // console.log(mouseX, mouseY);
  if(state == 0 & ready){
    background(0);
    fill(255);
    textSize(32);
    textFont(font);
    textAlign(CENTER, CENTER);
    text("Face Pong", width/2, height/2-80);
    rect(width/2, height/2+20, 200, 50);
    fill(0);
    textSize(18);
    text("1 Player", width/2, height/2 + 20);
    fill(255);
    rect(width/2, height/2+100, 200, 50);
    fill(0);
    textSize(18);
    text("2 Player", width/2, height/2 + 100);

    menupuck.checkPaddleRight(menuright);
    menupuck.checkPaddleLeft(menuleft);

    menuleft.show();
    menuright.show();
    menuleft.update();
    menuright.update();

    menupuck.update();
    menupuck.edges();
    menupuck.show();
  }
  // 2 Player Mode
  else if( state == 2){
    background(0);
    //flip image
    translate(width,0);
    scale(-1.0,1.0);
    image(video, 0, 0);
    tint(255, 220);
    // filter(GRAY);

    //undo flip
    translate(width,0);
    scale(-1.0,1.0);

    rect(width/2, height/2, 2, height);

    if (poses != undefined ) {
      for (let i = 0; i < poses.length; i++) {
        // console.log( poses[i].pose.keypoints ); // take a look at this first

        for (let j=0; j< poses[i].pose.keypoints.length; j++) {

          // console.log( poses[i].pose.keypoints[j] );
          let partname = poses[i].pose.keypoints[j].part;
          let score = poses[i].pose.keypoints[j].score;
          let x = poses[i].pose.keypoints[j].position.x;
          let y = poses[i].pose.keypoints[j].position.y;


          if (score > 0.5 & partname == "nose" & x > width/2 ) {
            // console.log(partname);
            noStroke();
            fill(0,255,0);
            ellipse((width - x),y,5,5);
            // text(partname, (width - x) + 10, y + 10);
            // text(nf(score, 0, 2), (width - x) + 10, y + 30);
            multileft.moveto(y);
          }
          else if (score > 0.5 & partname == "nose" & x < width/2 ) {
            // console.log(partname);
            noStroke();
            fill(0,0,255);
            ellipse((width - x),y,5,5);
            // text(partname, (width - x) + 10, y + 10);
            // text(nf(score, 0, 2), (width - x) + 10, y + 30);
            multiright.moveto(y);
          }
        }
      }
    }

    // translate(width,0);
    // scale(-1.0,1.0);

    multipuck.checkPaddleRight(multiright);
    multipuck.checkPaddleLeft(multileft);

    multileft.show();
    multiright.show();
    multileft.update();
    multiright.update();

    multipuck.update();
    multipuck.edges();
    multipuck.show();

    fill(255);
    textSize(32);
    text(leftscore, 64, 40);
    text(rightscore, width-64, 40);
    checkWinTwoPlayer();
  }
  // 1 Player Mode
  else if( state == 1){
    background(0);
    //flip image
    translate(width,0);
    scale(-1.0,1.0);
    image(video, 0, 0);
    tint(255, 220);
    // filter(GRAY);

    //undo flip
    translate(width,0);
    scale(-1.0,1.0);

    if (poses != undefined ) {
      for (let i = 0; i < poses.length; i++) {
        // console.log( poses[i].pose.keypoints ); // take a look at this first

        for (let j=0; j< poses[i].pose.keypoints.length; j++) {

          // console.log( poses[i].pose.keypoints[j] );
          let partname = poses[i].pose.keypoints[j].part;
          let score = poses[i].pose.keypoints[j].score;
          let x = poses[i].pose.keypoints[j].position.x;
          let y = poses[i].pose.keypoints[j].position.y;


          if (score > 0.5 & partname == "nose") {
            // console.log(partname);
            noStroke();
            fill(0,255,0);
            ellipse((width - x),y,5,5);
            // text(partname, (width - x) + 10, y + 10);
            // text(nf(score, 0, 2), (width - x) + 10, y + 30);
            left.moveto(y);
          }
        }
      }
    }

    // translate(width,0);
    // scale(-1.0,1.0);

    puck.checkPaddleRight(right);
    puck.checkPaddleLeft(left);

    left.show();
    right.show();
    left.update();
    right.update();

    puck.update();
    puck.edges();
    puck.show();

    fill(255);
    textSize(32);
    text(leftscore, 64, 40);
    text(rightscore, width-64, 40);
    checkWin();
  }
}

function checkWin(){
  if(leftscore >= 5){
    text("You Win", width/2, height/2-80);
    setTimeout(returnToMenu, 2000);
  }
  else if(rightscore >= 5){
    text("Computer Wins", width/2, height/2-80);
    setTimeout(returnToMenu, 2000);
  }
}

function checkWinTwoPlayer(){
  if(leftscore >= 5){
    text("You Win", width/2-150, height/2-80);
    text("You Lose", width/2+150, height/2-80);
    setTimeout(returnToMenu, 3000);
  }
  else if(rightscore >= 5){
    text("You Lose", width/2-150, height/2-80);
    text("You Win", width/2+150, height/2-80);
    setTimeout(returnToMenu, 3000);
  }
}

function returnToMenu(){
  state = 0;
  leftscore = 0;
  rightscore = 0;
}

function mouseClicked(){
  console.log(mouseX, mouseY);
  if(state == 0 & mouseX >= 200 & mouseX <= 400 & mouseY >= 200 & mouseY <= 250){
    console.log("1 Player Clicked");
    state = 1;
    leftscore = 0;
    rightscore = 0;
    start.play();
  }
  else if(state == 0 & mouseX >= 200 & mouseX <= 400 & mouseY >= 275 & mouseY <= 325){
    console.log("2 Player Clicked");
    state = 2;
    start.play();
  }
}

function modelReady() {
  console.log("Model Ready!");
  ready = true;
  music.loop();
}

class Puck {
    constructor() {
        this.x = width/2;
        this.y = height/2;
        this.xspeed = 0;
        this.yspeed = 0;
        this.r = 12;

        this.reset();
    }

    checkPaddleLeft(p) {
        if (this.y - this.r < p.y + p.h/2 &&
            this.y + this.r > p.y - p.h/2 &&
            this.x - this.r < p.x + p.w/2) {

            if (this.x > p.x) {
                let diff = this.y - (p.y - p.h/2);
                let rad = radians(45);
                let angle = map(diff, 0, p.h, -rad, rad);
                this.xspeed = 5 * cos(angle);
                this.yspeed = 5 * sin(angle);
                this.x = p.x + p.w/2 + this.r;
                bounce.play();
            }

        }
    }
    checkPaddleRight(p) {
        if (this.y - this.r < p.y + p.h/2 &&
            this.y + this.r > p.y - p.h/2 &&
            this.x + this.r > p.x - p.w/2) {

            if (this.x < p.x) {
                let diff = this.y - (p.y - p.h/2);
                let angle = map(diff, 0, p.h, radians(225), radians(135));
                this.xspeed = 5 * cos(angle);
                this.yspeed = 5 * sin(angle);
                this.x = p.x - p.w/2 - this.r;
                bounce.play();
            }
        }
    }

    update() {
        this.x += this.xspeed;
        this.y += this.yspeed;
    }

    reset() {
        this.x = width/2;
        this.y = height/2;
        let angle = random(-PI/4, PI/4);
        this.xspeed = 5 * Math.cos(angle);
        this.yspeed = 5 * Math.sin(angle);

        if (random(1) < 0.5) {
            this.xspeed *= -1;
        }
    }

    edges() {
        if (this.y < 0 || this.y > height) {
            this.yspeed *= -1;
        }

        if (this.x - this.r > width) {
            if(state != 0){
            ding.play();
            }
            leftscore++;
            this.reset();
        }

        if (this.x + this.r < 0) {
            if(state != 0){
            ding.play();
            }
            rightscore++;
            this.reset();
        }
    }

    show() {
        ballY = this.y;
        ballX = this.x;
        fill(255);
        ellipse(this.x, this.y, this.r*2);
    }
}

class Paddle {
    constructor(isLeft) {
        this.y = height/2;
        this.w = 20;
        this.h = 100;
        this.ychange = 0;
        this.x = this.w;
        if (isLeft) {
            this.x = this.w;
        } else {
            this.x = width - this.w;
        }
    }

    update() {
        this.y += this.ychange;
        this.y = constrain(this.y, this.h/2, height-this.h/2);
    }

    move(steps) {
        this.ychange = steps;
    }

    moveto(location) {
        this.y = location;
    }

    show() {
        fill(255);
        rectMode(CENTER);
        rect(this.x, this.y, this.w, this.h);
    }
}

class ComputerPaddle {
    constructor(isLeft) {
        this.y = height/2;
        this.w = 20;
        this.h = 100;
        this.ychange = 0;
        this.x = width - this.w;
        this.difficulty = 3;
        this.isLeft = isLeft;
        if (isLeft) {
            this.x = this.w;
        } else {
            this.x = width - this.w;
        }
    }

    update() {
        this.y += this.ychange;
        this.y = constrain(this.y, this.h/2, height-this.h/2);
        // var x_pos = Puck.getX();
        this.computerAI();
    }

    computerAI(){
      if(ballY != undefined){
        var diff = -((this.y + (this.h / 2)) - ballY);
        // console.log(ballY);
        // console.log(diff);
        if(diff < this.difficulty) { // max speed left
          diff = -this.difficulty;
        } else if(diff > this.difficulty) { // max speed right
          diff = this.difficulty;
        }
        if(this.isLeft & ballX <= width/2 + 50){
          this.move(diff, 0);
        }
        else if(!this.isLeft & ballX >= width/2 - 50){
          this.move(diff, 0);
        }
      }
    }

    move(steps) {
        this.ychange = steps;
    }

    moveto(location) {
        this.y = location;
    }

    show() {
        fill(255);
        rectMode(CENTER);
        rect(this.x, this.y, this.w, this.h);
    }
}
