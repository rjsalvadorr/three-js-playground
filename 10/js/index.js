///////////////////////////////////////////////////////////////////////////////
//   CONSTANTS
///////////////////////////////////////////////////////////////////////////////

const SHOW_AXIS_LINES = false;
const NUM_STARS = 200;
const NUM_PARTICLES = 60;

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

// Creating stars
const starGeometry = new THREE.SphereGeometry(1.5);
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

// Creating particles
const particles = [];
const particleColours = [0xCBBEB5, 0xc1d6da, 0xaf6261, 0x2196f3, 0x00ff7f, 0x50080c]
const particleGeometries = [
  new THREE.SphereBufferGeometry(10),
  new THREE.BoxBufferGeometry(10, 15, 12),
  new THREE.CylinderBufferGeometry(5, 5, 10),
]
let particleGeometry;
let particleMaterial;
let newParticle;
let newParticleOptions;
let newParticleMesh;
let particleCoords;

for(let i = 0; i < NUM_PARTICLES; i++) {
  particleGeometry = _.sample(particleGeometries);
  particleMaterial = new THREE.MeshLambertMaterial({
    color: _.sample(particleColours),
    flatShading: true,
  });
  newParticleMesh = new THREE.Mesh(particleGeometry, particleMaterial);
  particleCoords = getRandomSphereCoordinate(25);
  newParticleMesh.position.setX(particleCoords.x);
  newParticleMesh.position.setY(particleCoords.y);
  newParticleMesh.position.setZ(particleCoords.z);
  scene.add(newParticleMesh);
  
  // Set particle movement parameters
  newParticleOptions = {
    movements: [rjMovements.shake, rjMovements.move, rjMovements.spin],
    direction: getRandomVector(),
    rotationAxis: getRandomVector(),
  }

  newParticle = new RjMesh(
    newParticleMesh,
    259200,
    newParticleOptions,
  );

  particles.push(newParticle);
}

///////////////////////////////////////////////////////////////////////////////
//   MAIN RENDER/UPDATE LOOPS
///////////////////////////////////////////////////////////////////////////////

// Update loop
window.setInterval(function() {
  const currentTime = Date.now() / 1000;

  // Move camera
  const circleCoords = circleFunction(currentTime, 24, 1000);
  const verticalCoord = periodicFunction(currentTime, 24, -50, 200);
  camera.position.setX(circleCoords.x);
  camera.position.setZ(circleCoords.y / 1.6);
  camera.position.setY(verticalCoord);
  camera.lookAt(scene.position);

  // Make particles move
  for(let particle of particles) {
    particle.applyMovements();
  }
}, 1000 / 24);

// Render loop
let render = function() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

render();
