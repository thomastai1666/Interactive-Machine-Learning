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
var righthandX;
var righthandY;

//Three setup
var scene,
    mycamera,
    renderer,
    controls;
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var fruittypes = ['assets/watermelon.dae','assets/apple.dae'];

//raycaster
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function preload() {

}

function setup() {
  // createCanvas(600,400);
  // video = createCapture(VIDEO);
  // video.size(600, 400);
  // video.hide();
  //
  // poseNet = ml5.poseNet(video, modelReady);
  // poseNet.on('pose', function (results) {
  // poses = results;
  // });
}

function modelReady() {
  console.log("Model Ready!");
}

function draw() {
  // background(0);
  //flip image
  // translate(width,0);
  // scale(-1.0,1.0);
  // image(video, 0, 0);
  // tint(255, 220);
  // filter(GRAY);

  // drawKeypoints();
  // drawSkeleton();
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
      if (keypoint.part == "leftWrist") {
        if(keypoint.score > 0.3){
          lefthandX = keypoint.position.x + (window.innerWidth / 2);
          lefthandY = keypoint.position.y + (window.innerHeight * 0.1);
          // console.log(lefthandX, lefthandY);
          fill(0, 255, 0);
          noStroke();
          ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
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
  this.fruitobject;
  this.loader = new THREE.ColladaLoader();
  // loader.load( 'assets/apple.dae', myobject.load);
  this.loader.load(type, function (collada){
    this.loader.options.convertUpAxis = true;
    this.fruitobject = collada.scene;
    // dae.position.set(0.5, 0, 0);
    this.box = new THREE.Box3().setFromObject( this.fruitobject ); // compute the bounding box of the model
    this.box.getCenter( this.fruitobject.position ); // set position to be the center of the bounding box
    console.log(this.fruitobject);
    this.fruitobject.position.multiplyScalar( - 1 ); // negate the dae.position coordinates
    // console.log(apple);
    scene.add(this.fruitobject);
    this.fruitobject.position.x = -1;
    this.fruitobject.position.y = -1;
    this.fruitobject.position.z = 2;
    //change position to initial coordinates
    // fruitobject.position.z = this.y;
  	console.log("Model Loaded");
    console.log(this.fruitobject);
  });

  this.launch = function(){
    this.yvelocity += this.acceleration;
    console.log("Test");
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
    console.log("Hiding Apple");
  }

}

var myobject = new Fruit(fruittypes[0]);
myobject.launch();

var myobject2 = new Fruit(fruittypes[1]);
myobject2.launch();


/////////////////////////////////////////
// Mouse Event Listener
/////////////////////////////////////////

function onMouseMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

window.addEventListener( 'mousemove', onMouseMove, false );

function renderScene() {
  renderer.render( scene, mycamera );
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  //Update camera
  mycamera.updateMatrixWorld();
  // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, mycamera );



	// calculate objects intersecting the picking ray
  // var intersects = raycaster.intersectObjects( objects, true );
  // recursive flag must be set to true to detect collada objects
	var intersects = raycaster.intersectObjects( scene.children,true );

  if (intersects.length > 0 && mouse.x != 0 && mouse.y != 0){
    console.log("Found intersection");
    par = intersects[ 0 ].object.parent;
    console.log(par);
    while(par.type !== "Group"){
        par = par.parent;
    }
    groupName = par.name;
    console.log(par);
    scene.remove(par);
    for (var i = par.children.length - 1; i >= 0; i--) {
    par.remove(par.children[i]);
    console.log("Removing Object", groupName);
    }
  }

	renderer.render( scene, mycamera );
  myobject.update();

}


animationLoop();
