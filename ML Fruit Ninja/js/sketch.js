//Posenet Setup
let video;
let poseNet;
let poses = [];
let skeletons = [];


//Game Setup
var prevx;
var prevy;
var x;
var y;
var flapstate = false;
var flapvelocity;
var lefthandX;
var lefthandY;
var screenX;
var screenY;
// var righthandX;
// var righthandY;
var score = 0;
var randomnum = 0;

//Three setup
var scene,
    mycamera,
    renderer,
    controls;
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var fruittypes = ['assets/watermelon.dae','assets/apple.dae','assets/banana.dae', 'assets/orange.dae', 'assets/dynamite.dae'];

//raycaster
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var touch = new THREE.Vector2();

function preload() {

}

function setup() {
  createCanvas(window.innerWidth,window.innerHeight);
  video = createCapture(VIDEO);
  video.size(340, 220);
  video.hide();

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function (results) {
  poses = results;
  });
}

function modelReady() {
  console.log("Model Ready!");
}

function draw() {
  clear();
  // image(backgroundimg, 0, 0, window.innerWidth, window.innerHeight - 100);
  // draw ground
  translate(window.innerWidth,0);
  scale(-1.0,1.0);
  image(video, 0, 0);

  drawKeypoints();
  // drawSkeleton();
  // console.log(poses);
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = poses[i].pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.part == "rightWrist") {
        if(keypoint.score > 0.3){
          lefthandX = 340 - (keypoint.position.x);
          lefthandY = 220 -(keypoint.position.y);

          screenX = (keypoint.position.x / 340) * window.innerWidth;
          screenY = (keypoint.position.y / 220) * window.innerHeight;
          // console.log(screenY);
          touch.x = (screenX / window.innerWidth ) * 2 - 1;;
          // - ( event.clientY / window.innerHeight ) * 2 + 1;
          touch.y =  - (screenY / window.innerHeight) * 2 + 1;
          // console.log("Screen Cords", screenX, screenY);
          noStroke();
          fill(0, 255, 0);
          ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
          fill(0, 0, 255);
          ellipse(screenX, screenY, 20, 20);
        }
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  //leftWrist
  //leftElbow
  //rightWrist
  //rightElbow
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    // For every skeleton, loop through all body connections
    for (let j = 0; j < poses[i].skeleton.length; j++) {
      let partA = poses[i].skeleton[j][0];
      let partB = poses[i].skeleton[j][1];
      stroke(80, 80, 200);
      strokeWeight(15);
      if(partB.part == "leftWrist" && partA.part == "leftElbow"){
        console.log("Function 1");
        // console.log(partA.part);
        // console.log(partB.part);
        lefthandX = partB.position.x;
        lefthandY = partB.position.y;
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      }
      if(partB.part == "rightWrist" && partA.part == "rightElbow"){
        console.log("Function 2");
        // console.log(partA.part);
        // console.log(partB.part);
        righthandX = partB.position.x;
        righthandY = partB.position.y;
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      }
    }
  }
}

/////////////////////////////////////////
// Scene Setup
/////////////////////////////////////////
scene = new THREE.Scene();

mycamera = new THREE.PerspectiveCamera( 10, windowWidth / windowHeight, 1, 1000 );
mycamera.position.set(-5, 12, 10);
mycamera.lookAt( scene.position );

renderer = new THREE.WebGLRenderer({
  alpha: true,
    antialias: true
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( windowWidth, windowHeight );

document.body.appendChild( renderer.domElement );


/////////////////////////////////////////
// Lighting
/////////////////////////////////////////

var light_color  = '#FAFAFA';
var ambientLight  = new THREE.AmbientLight( '#EEEEEE' );
var hemiLight     = new THREE.HemisphereLight( light_color, light_color, 0 );
var light         = new THREE.PointLight( light_color, 1, 100 );

hemiLight.position.set( 0, 50, 0 );
light.position.set( 0, 20, 10 );

scene.add( ambientLight );
// scene.add( hemiLight );
// scene.add( light );


/////////////////////////////////////////
// Utilities
/////////////////////////////////////////

// var axisHelper = new THREE.AxisHelper( 1.25 );
// scene.add( axisHelper );


/////////////////////////////////////////
// Window Resizing
/////////////////////////////////////////

window.addEventListener( 'resize', function () {
  mycamera.aspect = window.innerWidth / window.innerHeight;
  mycamera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderScene();
}, false );


/////////////////////////////////////////
// Object Loader
/////////////////////////////////////////

function distance(x1,x2,y1,y2){
  var a = x1 - x2;
  var b = y1 - y2;
  return Math.sqrt( a*a + b*b );
}

function Fruit(type){
  this.y = 0;
  this.x = 100;
  this.gravity = 0.001;
  this.acceleration = -.1;
  this.xvelocity = 0;
  this.yvelocity = 0;
  this.score = 0;
  this.offset = 100;
  var fruitobject;
  // this.myfruit;
  var loader = new THREE.ColladaLoader();
  // loader.load( 'assets/apple.dae', myobject.load);
  loader.load(type, function (collada){
    loader.options.convertUpAxis = true;
    fruitobject = collada.scene;
    // dae.position.set(0.5, 0, 0);
    this.box = new THREE.Box3().setFromObject( fruitobject ); // compute the bounding box of the model
    this.box.getCenter( fruitobject.position ); // set position to be the center of the bounding box
    // console.log(fruitobject);
    fruitobject.position.multiplyScalar( - 1 ); // negate the dae.position coordinates
    // console.log(apple);
    scene.add(fruitobject);
    // this.myfruit = fruitobject;
    fruitobject.position.x = -1;
    fruitobject.position.y = -1;
    fruitobject.position.z = 2;
    //change position to initial coordinates
    // fruitobject.position.z = this.y;
  	console.log("Model Loaded");
    // console.log(fruitobject);
  });

  this.launch = function(){
    this.yvelocity += this.acceleration;
    console.log("Test");
    // console.log(fruits);
    // console.log(this.myfruit);
  }

  this.update = function(){
    //handle gravity
    if (fruitobject != undefined){
      //"terminal" velocity
      if(this.yvelocity <= 0.3){
        this.yvelocity += this.gravity;
      }
      this.y += this.yvelocity;
      // console.log(this.yvelocity);
      fruitobject.translateZ(-this.yvelocity);
      fruitobject.rotation.z += .01;
    }
    //prevent fruit from falling off bottom
    if (this.y > 1.5) {
      // this.y = window.innerHeight;
      this.yvelocity = 0;
      this.launch();
      console.log("Relaunching Fruit");
    }

    //move object to local coordinates
  }

  this.hide = function(){
    fruitobject.translateZ(-10);
    fruitobject.remove();
    console.log("Hiding Fruit");
  }

}

var myobject = new Fruit(fruittypes[0]);
myobject.launch();


///////////////////////////////////////
//Mouse Event Listener
///////////////////////////////////////

function onMouseMove( event ) {
  console.log("Mouse", event.clientX, event.clientY);
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

window.addEventListener( 'mousemove', onMouseMove, false );

function renderScene() {
  renderer.render( scene, mycamera );
}

function animationLoop() {
  requestAnimationFrame(animationLoop);

	renderer.render( scene, mycamera );

  //Update camera
  mycamera.updateMatrixWorld();
  // update the picking ray with the camera and mouse position
  // raycaster.setFromCamera( mouse, mycamera ); testing only
  // console.log("Mouse Cords: ", event.clientX, event.clientY);
  // console.log("Touch Cords: ", touch.x, touch.y);
  console.log("Mouse at", mouse);
  console.log("Touch at", touch);
	raycaster.setFromCamera( touch, mycamera );



	// calculate objects intersecting the picking ray
  // var intersects = raycaster.intersectObjects( objects, true );
  // recursive flag must be set to true to detect collada objects
	var intersects = raycaster.intersectObjects( scene.children,true );

  if (intersects.length > 0 && touch.x != 0 && touch.y != 0){
    console.log("Found intersection");
    par = intersects[ 0 ].object.parent;
    console.log(par);
    while(par.type !== "Group"){
        par = par.parent;
    }
    groupName = par.name;
    console.log(par);
    // scene.remove(par);
    for (var i = par.children.length - 1; i >= 0; i--) {
    myobject.hide();
    // par.remove(par.children[i]);
    // console.log("Removing Object", groupName);
    setTimeout(launchFruit, 300);
    }
    score+=1;
    document.getElementById('score').innerText = "Score: " + score;
    if(randomnum == 4){
      simulateFlash();
      document.getElementById('score').innerText = "Gameover";
      score = 0;
    }
  }

  myobject.update();

}

function launchFruit(){
  randomnum = randomInteger(0,5)
  myobject = new Fruit(fruittypes[randomnum]);
  console.log(randomnum);
  myobject.launch();
}

function simulateFlash(){
  document.getElementsByClassName("backgroundSolid")[0].style.zIndex = 4;
  document.getElementsByClassName("backgroundSolid")[0].style.animation = "blackout .1s forwards";
  setTimeout(simulateFlash1, 100);
  setTimeout(simulateFlash2, 700);
}

function simulateFlash1(){
  document.getElementsByClassName("backgroundSolid")[0].style.animation = "undo-blackout .6s forwards";
}

function simulateFlash2(){
  document.getElementsByClassName("backgroundSolid")[0].style.zIndex = -2;
}

//https://www.w3schools.com/js/js_random.asp
function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

animationLoop();
