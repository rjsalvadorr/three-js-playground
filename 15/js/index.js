///////////////////////////////////////////////////////////////////////////////
//   CONSTANTS
///////////////////////////////////////////////////////////////////////////////

const SHOW_AXIS_LINES = false;
const SHOW_CAMERA_TARGET = true;
const CAMERA_TARGET = new THREE.Vector3(-40, 0, 0);

const STAR_RADIUS = 50;
const UPDATES_PER_SECOND = 24;

///////////////////////////////////////////////////////////////////////////////
//   THREE.JS ESSENTIALS
///////////////////////////////////////////////////////////////////////////////

let scene = new THREE.Scene ();
let camera = new THREE.PerspectiveCamera (
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set (STAR_RADIUS * 1.5, STAR_RADIUS * -0.5, STAR_RADIUS * 1.5);
camera.lookAt (CAMERA_TARGET);

let renderer = new THREE.WebGLRenderer ({antialias: true});
renderer.setSize (window.innerWidth, window.innerHeight);
const canvasWrapper = document.getElementById('canvas-wrapper');
canvasWrapper.appendChild (renderer.domElement);

let light = new THREE.DirectionalLight ('white', 0.8);
light.position.set (2, 3, 0);
scene.add (light);

if (SHOW_AXIS_LINES) {
  const axesHelper = new THREE.AxesHelper (200);
  scene.add (axesHelper);
}

if (SHOW_CAMERA_TARGET) {
  const targetHelperGeo = new THREE.SphereGeometry (5);
  const targetHelperMat = new THREE.LineBasicMaterial ({
    color: 0xf0ff00,
    lights: false,
  });
  const targetHelper = new THREE.Mesh (targetHelperGeo, targetHelperMat);
  targetHelper.position.set(CAMERA_TARGET);
  scene.add (targetHelper);
}

///////////////////////////////////////////////////////////////////////////////
//   MAIN OBJECTS
///////////////////////////////////////////////////////////////////////////////

// Creating stars
const globeGeometry = new THREE.IcosahedronGeometry (STAR_RADIUS, 2);

const starGroup = new THREE.Group ();
const starGeometry = new THREE.SphereGeometry (1);
const starMaterial = new THREE.LineBasicMaterial ({
  color: 0xdd0000,
  lights: false,
});
let newStar;
let starCoords;
for (let starPos of globeGeometry.vertices) {
  newStar = new THREE.Mesh (starGeometry, starMaterial);

  newStar.position.setX (starPos.x);
  newStar.position.setY (starPos.y);
  newStar.position.setZ (starPos.z);

  starGroup.add (newStar);
}
scene.add (starGroup);

///////////////////////////////////////////////////////////////////////////////
//   MAIN RENDER/UPDATE LOOPS
///////////////////////////////////////////////////////////////////////////////

// Update loop
let startTime = Date.now () / 1000;
window.setInterval (function () {
  const currentTime = Date.now () / 1000;

  // Rotate star globe
  starGroup.rotateY (Math.PI / 180);
  starGroup.rotateZ (Math.PI / 360);
}, 1000 / UPDATES_PER_SECOND);

// Render loop
let render = function () {
  requestAnimationFrame (render);
  renderer.render (scene, camera);
};

render ();
