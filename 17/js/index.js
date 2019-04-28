///////////////////////////////////////////////////////////////////////////////
//   CONSTANTS
///////////////////////////////////////////////////////////////////////////////

const SHOW_AXIS_LINES = false;
const NUM_STARS = 100;
const CAMERA_POS = new THREE.Vector3(-15, 10, -40);

///////////////////////////////////////////////////////////////////////////////
//   THREE.JS ESSENTIALS
///////////////////////////////////////////////////////////////////////////////

let scene = new THREE.Scene ();
let camera = new THREE.PerspectiveCamera (
  45,
  window.innerWidth / window.innerHeight,
  1,
  3000
);
camera.position.set (CAMERA_POS.x, CAMERA_POS.y, CAMERA_POS.z);
camera.lookAt (scene.position);

let renderer = new THREE.WebGLRenderer ({antialias: true});
renderer.setSize (window.innerWidth, window.innerHeight);
const canvasWrapper = document.createElement ('div');
canvasWrapper.className = 'canvas-wrapper';
canvasWrapper.appendChild (renderer.domElement);
window.document.body.appendChild (canvasWrapper);

let light = new THREE.DirectionalLight ('white', 0.8);
light.position.set (2, 3, 0);
scene.add (light);

if (SHOW_AXIS_LINES) {
  const axesHelper = new THREE.AxesHelper (200);
  scene.add (axesHelper);
}

///////////////////////////////////////////////////////////////////////////////
//   MAIN OBJECTS
///////////////////////////////////////////////////////////////////////////////

// Creating projectiles
const shootingStars = [];
let newShootingStarGeo;
let newShootingStarMat;
let newShootingStar;

for(let i = 0; i < NUM_STARS; i++) {
  newShootingStarGeo = new THREE.BoxGeometry (0.1, 0.1, 3);
  newShootingStarMat = new THREE.LineBasicMaterial ({
    color: 0xffffff,
    lights: false,
  });
  newShootingStar = new RjLaser(
    new THREE.Mesh(newShootingStarGeo, newShootingStarMat),
    new THREE.Vector3(0, 0, 50),
    new THREE.Vector3(getRandomInt(-20, 20), getRandomInt(-15, 15), getRandomInt(-10, 30)),
    1,
    2,
  ),
  scene.add(newShootingStar.mesh);
  shootingStars.push(newShootingStar);
}

// Creating ships
const ships = [];
const loader = new THREE.GLTFLoader ();
let newShip;
loader.load (
  'models/low_poly_space_ship/scene.gltf',
  function (gltf) {
    const shippyShip = gltf.scene.children[0];

    newShip = new RjMesh (shippyShip, 99999, {});
    newShip.mesh.scale.set (3, 3, 3);
    ships.push (newShip);
    scene.add (newShip.mesh);

    newShip = new RjMesh (shippyShip.clone (true), 99999, {});
    newShip.mesh.scale.set (3, 3, 3);
    newShip.mesh.position.set (10, 0, 0);
    ships.push (newShip);
    scene.add (newShip.mesh);

    newShip = new RjMesh (shippyShip.clone (true), 99999, {});
    newShip.mesh.scale.set (3, 3, 3);
    newShip.mesh.position.set (0, 0, 10);
    ships.push (newShip);
    scene.add (newShip.mesh);
  },
  undefined,
  function (error) {
    console.error (error);
  }
);

const NUM_SHIPS = 3;

const randomPeriods = [
  getRandomInt (3, 8),
  getRandomInt (3, 8),
  getRandomInt (3, 8),
  getRandomInt (4, 10),
  getRandomInt (4, 10),
  getRandomInt (4, 10),
  getRandomInt (4, 10),
  getRandomInt (4, 10),
  getRandomInt (4, 10),
];

const randomDistances = [];
let randomRange;
for (let i = 0; i < NUM_SHIPS * 3; i++) {
  randomDist = getRandomInt (-3, 0);
  randomDistances.push ([randomDist, Math.abs (randomDist)]);
}

///////////////////////////////////////////////////////////////////////////////
//   MAIN RENDER/UPDATE LOOPS
///////////////////////////////////////////////////////////////////////////////

// Update loop
let startTime = Date.now () / 1000;
window.setInterval (function () {
  const currentTime = Date.now () / 1000;

  // Move ship
  const shipVerticalCoords = [
    periodicFunction (currentTime, randomPeriods[0], 0, 5),
    periodicFunction (currentTime, randomPeriods[1], -10, -5),
    periodicFunction (currentTime, randomPeriods[2], 10, 15),
  ];
  const shipXCoords = [
    periodicFunction (currentTime, randomPeriods[3], 0, 3),
    periodicFunction (currentTime, randomPeriods[4], -12, -5),
    periodicFunction (currentTime, randomPeriods[5], 12, 15),
  ];
  const shipZCoords = [
    periodicFunction (currentTime, randomPeriods[3], 0, 3),
    periodicFunction (currentTime, randomPeriods[4], -12, -5),
    periodicFunction (currentTime, randomPeriods[5], 12, 15),
  ];

  if (!_.isEmpty (ships)) {
    ships[0].mesh.position.setY (shipVerticalCoords[0]);
    ships[1].mesh.position.setY (shipVerticalCoords[1]);
    ships[2].mesh.position.setY (shipVerticalCoords[2]);

    ships[0].mesh.position.setX (shipXCoords[0]);
    ships[1].mesh.position.setX (shipXCoords[1]);
    ships[2].mesh.position.setX (shipXCoords[2]);

    ships[0].mesh.position.setZ (shipZCoords[0]);
    ships[1].mesh.position.setZ (shipZCoords[1]);
    ships[2].mesh.position.setZ (shipZCoords[2]);
  }

  for(let shootingStar of shootingStars) {
    shootingStar.shoot(4);
  }
}, 1000 / 24);

// Render loop
let render = function () {
  requestAnimationFrame (render);
  renderer.render (scene, camera);
};

render ();
