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
var gravity = -9.8;
var xspeed = 0;
var yspeed = 0;
var xacel = 0;
var yacel = 0;
var windowWidth = 600;
var windowHeight = 400;

function preload() {

}

function setup() {
  createCanvas(600,400);
  video = createCapture(VIDEO);
  video.size(600, 400);
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
  // background(0);
  //flip image
  translate(width,0);
  scale(-1.0,1.0);
  image(video, 0, 0);
  tint(255, 220);
  // filter(GRAY);

  drawKeypoints();
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
          console.log(lefthandX, lefthandY);
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
// Trackball Controller
/////////////////////////////////////////

// controls = new THREE.TrackballControls( mycamera );
// controls.rotateSpeed = 5.0;
// controls.zoomSpeed = 3.2;
// controls.panSpeed = 0.8;
// controls.noZoom = false;
// controls.noPan = true;
// controls.staticMoving = false;
// controls.dynamicDampingFactor = 0.2;


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
// Render Loop
/////////////////////////////////////////

function renderPhone() {
  renderer.render( scene, mycamera );
}

// Render the scene when the controls have changed.
// If you don’t have other animations or changes in your scene,
// you won’t be draining system resources every frame to render a scene.
// controls.addEventListener( 'change', renderPhone );

// Avoid constantly rendering the scene by only
// updating the controls every requestAnimationFrame
function animationLoop() {
  requestAnimationFrame(animationLoop);
	if(apple != undefined){
		// apple.rotation.z += 0.1;
    // bomb.rotation.y += 0.1;
    // console.log(apple.position.x);
    //convert from world position to screen coordinates
    //stackoverflow
    //https://stackoverflow.com/questions/11586527/converting-world-coordinates-to-screen-coordinates-in-three-js-using-projection

    // var p = apple.position.clone();
		// mycamera.updateMatrixWorld(); // FIX
		// p.project( mycamera )
		// console.log( p );

    var width = window.innerWidth, height = window.innerHeight;
    var widthHalf = width / 2, heightHalf = height / 2;

    var pos = apple.position.clone();
    pos.project(mycamera);
    pos.x = ( pos.x * widthHalf ) + widthHalf;
    pos.y = - ( pos.y * heightHalf ) + heightHalf;
    console.log(pos.x, pos.y);

    // var totaldistancetoleft = distance(apple.position.x, apple.position.y, lefthandX, lefthandY);
    // var totaldistancetoright = distance(apple.position.x, apple.position.y, righthandX, righthandY);
    // console.log(apple.position.x);
    // console.log(totaldistancetoleft);
    // if(totaldistancetoleft <= 10 || totaldistancetoright <= 10){
    //   console.log("HIT")
    // }
		// console.log(apple);
	}
  renderPhone();
  // draw();
}

animationLoop();


/////////////////////////////////////////
// Window Resizing
/////////////////////////////////////////

// window.addEventListener( 'resize', function () {
//   mycamera.aspect = windowWidth / windowHeight;
//   mycamera.updateProjectionMatrix();
//   renderer.setSize( windowWidth, windowHeight );
//   renderPhone();
// }, false );


/////////////////////////////////////////
// Object Loader
/////////////////////////////////////////

var dae;
var loader = new THREE.ColladaLoader();
var apple;
var bomb;
var fruits = [];

function loadCollada( collada ) {
  apple = collada.scene;
  // dae.position.set(0.5, 0, 0);
  var box = new THREE.Box3().setFromObject( apple ); // compute the bounding box of the model
  box.getCenter( apple.position ); // set dae.position to be the center of the bounding box
  console.log(apple);
  apple.position.multiplyScalar( - 1 ); // negate the dae.position coordinates
  // console.log(apple);
  scene.add(apple);
	console.log("Model Loaded");
  // console.log(collada);
  renderPhone();
}

function loadBomb( collada ) {
  bomb = collada.scene;
  // dae.position.set(0.5, 0, 0);
  var box = new THREE.Box3().setFromObject( bomb ); // compute the bounding box of the model
  box.getCenter( bomb.position ); // set dae.position to be the center of the bounding box
  bomb.position.multiplyScalar( - 1 ); // negate the dae.position coordinates
  // console.log(bomb);
  scene.add(bomb);
	// console.log("Something else Loaded");
  renderPhone();
}

loader.options.convertUpAxis = true;
loader.load( 'assets/apple.dae', loadCollada);
// loader.load( 'assets/bomb.dae', loadBomb);
// loader.load( 'assets/orange.dae', loadCollada);

function distance(x1,x2,y1,y2){
  var a = x1 - x2;
  var b = y1 - y2;
  return Math.sqrt( a*a + b*b );
}
