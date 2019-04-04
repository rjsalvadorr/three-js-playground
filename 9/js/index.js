///////////////////////////////////////////////////////////////////////////////
//   CONSTANTS
///////////////////////////////////////////////////////////////////////////////

const SHOW_AXIS_LINES = false;
const NUM_MOONS = 10;
const NUM_STARS = 250;

///////////////////////////////////////////////////////////////////////////////
//   UTILS
///////////////////////////////////////////////////////////////////////////////

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
* Returns a value between minValue and maxValue (both inclusive), where 
* x = minValue returns minValue
* x = (period / 2) returns maxValue
* x = (period * 2) returns minValue
* x = (period * 2.5) returns maxValue
* x = (period * 3) returns minValue
* etc...
*/
const periodicFunction = (x, period, minValue, maxValue) => {
  const cosArg = x * Math.PI / (period / 2);
  const amplitude = (maxValue - minValue) / 2;
  return Math.cos(cosArg) * -amplitude + (amplitude + minValue);
}

/**
* Returns a set of coords (x, y) tracing a circle
* where period == time of cycle, and radius ==
* radius of the circle. The circle is centred at (0, 0)
*/
const circleFunction = (input, period, radius) => {
  const inputArg = input * Math.PI / (period / 2);
  const yCoord = Math.sin(inputArg) * radius;
  const xCoord = Math.cos(inputArg) * radius;
  return {
    x: xCoord,
    y: yCoord,
  }
}

/**
* Returns a set of coords (x, y, z) representing a point on a sphere
* with the given radius. The sphere is centered at (0, 0, 0)
*/
const getRandomSphereCoordinate = (radius) => {
  const xyCoords = circleFunction(getRandomInt(0, 1000), 500, radius);
  const xRadius = Math.abs(xyCoords.x);
  const xzCoords = circleFunction(getRandomInt(0, 1000), 500, xRadius);
  return {
    x: xzCoords.x,
    y: xyCoords.y,
    z: xzCoords.y,
  }
}

///////////////////////////////////////////////////////////////////////////////
//   THREE.JS ESSENTIALS
///////////////////////////////////////////////////////////////////////////////

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  3000,
);
camera.lookAt(scene.position);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
window.document.body.appendChild(renderer.domElement);

let light = new THREE.DirectionalLight('white', 0.8);
light.position.set(2, 3, 0);
scene.add(light);

if(SHOW_AXIS_LINES) {
  const axesHelper = new THREE.AxesHelper(200);
  scene.add( axesHelper ); 
}

///////////////////////////////////////////////////////////////////////////////
//   MAIN OBJECTS
///////////////////////////////////////////////////////////////////////////////

// Creating "sun", or the object in the centre
const centreGeometry = new THREE.IcosahedronGeometry(42, 0);
const centreMaterial = new THREE.MeshLambertMaterial({
  color: 0xbe9b7b,
  flatShading: true,
  transparent: false,
});

const centreMesh = new THREE.Mesh(centreGeometry, centreMaterial);
centreMesh.receiveShadow = false;
centreMesh.position.set(0, 0, 0);
scene.add(centreMesh);

// Creating moons
const moonColours = [0xCBBEB5, 0xc1d6da, 0xaf6261, 0x2196f3, 0x00ff7f, 0x50080c]
const moons = [];
let moonGeometry;
let moonMaterial 
let moonOptions;
let moonMesh;
let ringGeometry;
let ringMesh;

const orbitMaterial = new THREE.LineBasicMaterial({
  color: 0x888888,
  lights: false,
  side: THREE.DoubleSide,
});

for(let i = 0; i < NUM_MOONS; i++) {
  moonGeometry = new THREE.SphereGeometry(getRandomInt(4, 12));
  moonOptions = {
    orbitPeriod: getRandomInt(3, 12),
    orbitRadius: getRandomInt(50, 450),
  };
  moonMaterial = new THREE.MeshLambertMaterial({
    color: _.sample(moonColours),
    flatShading: true,
  });
  moonMesh = new RjMesh(
    new THREE.Mesh(moonGeometry, moonMaterial),
    259200,
    moonOptions,
  );
  moons.push(moonMesh);
  scene.add(moonMesh.mesh);

  ringGeometry = new THREE.RingGeometry(
    moonOptions.orbitRadius - 1,
    moonOptions.orbitRadius,
    64,
  );
  ringMesh = new THREE.Mesh(ringGeometry, orbitMaterial);
  ringMesh.rotateX(Math.PI / 2);
  ringMesh.receiveShadow = false;
  scene.add(ringMesh);
}

// Creating stars
const starGeometry = new THREE.SphereGeometry(2);
const starMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  lights: false,
});

let newStar;
let starCoords;
for(let i = 0; i < NUM_STARS; i++) {
  newStar = new THREE.Mesh(starGeometry, starMaterial);
  
  starCoords = getRandomSphereCoordinate(1500);
  newStar.position.setX(starCoords.x);
  newStar.position.setY(starCoords.y);
  newStar.position.setZ(starCoords.z);

  scene.add(newStar);
}

///////////////////////////////////////////////////////////////////////////////
//   MAIN RENDER/UPDATE LOOPS
///////////////////////////////////////////////////////////////////////////////

// Update loop
window.setInterval(function() {
  const currentTime = Date.now() / 1000;

  let currentMoon;
  let moonCoords;
  for(let i = 0; i < NUM_MOONS; i++) {
    currentMoon = moons[i];
    moonCoords = circleFunction(
      currentTime,
      currentMoon.options.orbitPeriod,
      currentMoon.options.orbitRadius,
    );
    currentMoon.mesh.position.setX(moonCoords.x);
    currentMoon.mesh.position.setZ(moonCoords.y);
  }
  
  // Move camera
  const circleCoords = circleFunction(currentTime, 24, 1000);
  const verticalCoord = periodicFunction(currentTime, 24, -50, 200);
  camera.position.setX(circleCoords.x);
  camera.position.setZ(circleCoords.y / 1.2);
  camera.position.setY(verticalCoord);
  camera.lookAt(scene.position);
}, 1000 / 24);

// Render loop
let render = function() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

render();
