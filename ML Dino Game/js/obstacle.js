function Obstacle(type, speed) {
  this.spacing = 175;
  //dino (0), cactus(1), or big cactus (2)
  this.bottom = 100;
  this.x = width;
  this.w = 80;
  this.speed = speed;
  this.offset = 100;
  this.type = type;
  this.cactusImage1 = loadImage('assets/cactusBig0000.png');
  this.cactusImage2 = loadImage('assets/cactusSmall0000.png');
  this.cactusImage3 = loadImage('assets/cactusSmallMany0000.png');
  this.options = [this.cactusImage1, this.cactusImage2, this.cactusImage3];

  this.gameOver = false;

  this.hits = function(dino) {
    if (dino.y < this.top || dino.y > height - this.bottom - this.offset) {
      if (dino.x > this.x && dino.x < this.x + this.w) {
        this.gameOver = true;
        return true;
      }
    }
    this.gameOver = false;
    return false;
  }

  this.show = function() {
    fill(0);
    if (this.gameOver) {
      console.log("Game Over");
    }
    // rect(this.x, 0, this.w, this.top);
    // console.log(this.bottom)
    // rect(this.x, height-this.bottom-this.offset, this.w, this.bottom);
    if(this.type == 0){
      image(this.options[this.type], this.x, window.innerHeight - this.bottom - this.offset);
    }
    else{
      image(this.options[this.type], this.x, window.innerHeight - this.bottom - this.offset + 20);
    }

  }

  this.update = function() {
    this.x -= this.speed;
    // console.log(this.speed);
  }


  this.offscreen = function() {
    if (this.x < -this.w) {
      return true;
    } else {
      return false;
    }
  }


}
