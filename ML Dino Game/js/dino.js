var highscore = 0;

function Dino() {
  this.y = height/2;
  this.x = 100;
  this.offset = 100;
  this.dinoWidth = 32;
  this.dinoHeight = 100;

  this.gravity = 0.65;
  this.lift = -21;
  this.velocity = 0;
  this.score = 0;

  //images from codebullet
  this.dinoImg1 = loadImage('assets/dinorun0000.png');
  this.dinoImg2 = loadImage('assets/dinorun0001.png');
  this.dinoImg3 = loadImage('assets/dinoJump0000.png');
  this.myFont = loadFont('assets/8-bitpusab.ttf');

  this.runCounter = 0;

  this.show = function() {
    fill(0);
    // ellipse(this.x, this.y, 32, 32);
    this.runCounter+=1;
    this.score += 1;
    if(!this.isOnGround()){
      image(this.dinoImg3, this.x, this.y-this.offset);
    }
    else if(this.runCounter < 15){
      image(this.dinoImg1, this.x, this.y-this.offset);
    }
    else if(this.runCounter < 30){
      image(this.dinoImg2, this.x, this.y-this.offset);
    }
    if(this.runCounter >= 29)
    {
      this.runCounter = 0;
    }
    // console.log(this.runCounter);
    // rect(, , this.dinoWidth, this.dinoHeight);
  }

  this.up = function() {
    //only jump if dino has touched ground
    // console.log(height - this.y);
    if(this.isOnGround()){
      this.dinoHeight = 64;
      this.velocity += this.lift;
    }
  }

  this.isOnGround = function(){
    return (height - this.y == this.offset);
  }

  this.down = function() {
    //only duck if dino has touched ground
    // console.log(height - this.y);
    if(height - this.y == this.offset){
      // this.dinoHeight = 32;
    }
  }

  this.update = function() {
    //handle gravity
    this.velocity += this.gravity;
    this.y += this.velocity;

    //prevent dino from falling off bottom
    if (this.y > height - this.offset) {
      this.y = height - this.offset;
      this.velocity = 0;
    }
    this.showScore();
  }

  this.showScore = function() {
    fill('#000000');
    textFont(this.myFont);
    textSize(16);
    // https://stackoverflow.com/questions/14879691/get-number-of-digits-with-javascript/14879700
    if(this.score > highscore){
      highscore = this.score;
    }
    var length = Math.log(this.score) * Math.LOG10E + 1 | 0
    text(this.score, window.innerWidth - (20 * length), 60);
    var length2 = Math.log(highscore) * Math.LOG10E + 1 | 0
    text("HI-" + highscore, window.innerWidth - (20 * length2) - 52 , 30);
    // console.log(this.score);
  }

  this.gameOver = function(){
    if(this.score > highscore){
      highscore = this.score;
      console.log(highscore);
    }
  }

}
