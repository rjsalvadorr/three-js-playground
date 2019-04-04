///////////////////////////////////////////////////////////////////////////////
//   CONSTANTS
///////////////////////////////////////////////////////////////////////////////

const SHOW_AXIS_LINES = false;
const NUM_MOONS = 10;
const NUM_STARS = 200;

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
* radius of the circle. The circle is centred at (0, 0).
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

///////////////////////////////////////////////////////////////////////////////
//   THREE.JS ESSENTIALS
///////////////////////////////////////////////////////////////////////////////

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  4000,
);
camera.lookAt(scene.position);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
window.document.body.appendChild(renderer.domElement);

let light = new THREE.DirectionalLight('white', 0.8);
light.position.set(2, 3, 0);
scene.add(light);

if(SHOW_AXIS_LINES) {
  // X axis = blue
  const lineGeometryX = new THREE.Geometry();
  lineGeometryX.vertices.push(new THREE.Vector3(-200, 0, 0));
  lineGeometryX.vertices.push(new THREE.Vector3(200, 0, 0));
  const lineMaterialX = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const lineX = new THREE.Line(lineGeometryX, lineMaterialX);

  // Y axis = green
  const lineGeometryY = new THREE.Geometry();
  lineGeometryY.vertices.push(new THREE.Vector3(0, -200, 0));
  lineGeometryY.vertices.push(new THREE.Vector3(0, 200, 0));
  const lineMaterialY = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const lineY = new THREE.Line(lineGeometryY, lineMaterialY);

  // Z axis = red
  const lineGeometryZ = new THREE.Geometry();
  lineGeometryZ.vertices.push(new THREE.Vector3(0, 0, -200));
  lineGeometryZ.vertices.push(new THREE.Vector3(0, 0, 200));
  const lineMaterialZ = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const lineZ = new THREE.Line(lineGeometryZ, lineMaterialZ);

  scene.add(lineX);
  scene.add(lineY);
  scene.add(lineZ);  
}

///////////////////////////////////////////////////////////////////////////////
//   MAIN OBJECTS
///////////////////////////////////////////////////////////////////////////////

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

const orbitMaterial = new THREE.LineBasicMaterial({
  color: 0x888888,
  lights: false,
  side: THREE.DoubleSide,
});

const moonColours = [0xCBBEB5, 0xc1d6da, 0xaf6261, 0x2196f3, 0x00ff7f, 0x50080c]
const moons = [];
let moonGeometry;
let moonMaterial 
let moonOptions;
let moonMesh;
let ringGeometry;
let ringMesh;

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

const starGeometry = new THREE.SphereGeometry(2);
const starMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  lights: false,
});

let newStar;
let starCoords;
for(let i = 0; i < NUM_STARS; i++) {
  newStar = new THREE.Mesh(starGeometry, starMaterial);
  
  starCoords = circleFunction(getRandomInt(0, 1000), 500, 1800);
  newStar.position.setX(starCoords.x);
  newStar.position.setY(getRandomInt(-1000, 1000));
  newStar.position.setZ(starCoords.y);

  scene.add(newStar);
  // console.log(newStar);
}

///////////////////////////////////////////////////////////////////////////////
//   MAIN RENDER LOOP
///////////////////////////////////////////////////////////////////////////////

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
  const verticalCoord = periodicFunction(currentTime, 24, -100, 200);
  camera.position.setX(circleCoords.x);
  camera.position.setZ(circleCoords.y / 1.1);
  camera.position.setY(verticalCoord);
  camera.lookAt(scene.position);
}, 1000 / 24);

let render = function() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);

  // console.log(camera.position);
}

render();
