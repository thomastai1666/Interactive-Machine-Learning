function Cloud(type, speed) {
  this.spacing = 175;
  this.bottom = 100;
  this.x = width;
  this.w = 80;
  this.speed = speed;
  this.offset = 100;
  this.cactusImage = loadImage('assets/cactusBig0000.png');

  this.show = function() {
    image(this.cactusImage, this.x, window.innerHeight - this.bottom - this.offset);
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
