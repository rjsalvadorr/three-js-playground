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

///////////////////////////////////////////////////////////////////////////////
//   PREPARING RANDOM OBJECTS
///////////////////////////////////////////////////////////////////////////////

const optsGeometry = [
  new THREE.ConeGeometry(30, 60, 40),
  new THREE.BoxGeometry(50, 60, 40),
  new THREE.IcosahedronGeometry(20, 0),
  new THREE.CylinderGeometry(10, 10, 20, 32),
  new THREE.SphereGeometry(15, 32, 32),
  new THREE.DodecahedronGeometry(20, 0),
];

const optsColour = ['green', 'red', 'orange', 'blue', 'yellow', 'purple', 'white', 'grey', 'gold', 'silver'];

const optsMaterial = [];
for(let colour of optsColour) {
  optsMaterial.push(new THREE.MeshLambertMaterial({
    color: colour,
    flatShading: true,
  }));
};

const optsVectors = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(1, 0, 1),
  new THREE.Vector3(2, 0, 1),
  new THREE.Vector3(0, 1, 2),
];

const optsRotation = [-0.08, 0.08, 0.012, 0.016];

const optsTranslation = [
  {x: 3, y: 0, z: 0},
  {x: 0, y: 3, z: 0},
  {x: 0, y: 0, z: 3},
  {x: 3, y: 0, z: 4},
  {x: 3, y: 4, z: 0},
  {x: 0, y: 3, z: 4},
];

const createRandomMesh = () => {
  const nuGeometry = _.sample(optsGeometry);
  const nuMaterial = _.sample(optsMaterial);
  const nuMesh = new THREE.Mesh(nuGeometry, nuMaterial);

  nuMesh.rotation.x = THREE.Math.degToRad(_.sample([15, 20, 5, 0]));
  nuMesh.rotation.y = THREE.Math.degToRad(_.sample([30, 25, 45, 5]));
  nuMesh.name = `mesh-${Date.now()}`
  
  return nuMesh;
}

const createRandomMeshProps = () => {
  const nuProps = {
    rotation: {
      x: _.sample(optsRotation),
      y: _.sample(optsRotation),
      z: _.sample(optsRotation),
    },
    translation: _.sample(optsTranslation),
    isShakey: _.sample([true, false]),
    isSpinning: _.sample([true, false]),
    isRotating: _.sample([true, false]),
    lifespan: _.sample([100, 150, 200, 250, 300]),
  };

  if(!nuProps.isShakey && !nuProps.isSpinning && !nuProps.isRotating) {
    nuProps.isRotating = true;
  }

  return nuProps;
}

///////////////////////////////////////////////////////////////////////////////
//   THREE.JS ESSENTIALS
///////////////////////////////////////////////////////////////////////////////

let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera(
  window.innerWidth / -2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  window.innerHeight / -2,
  1,
  2000
);
camera.position.set(500, 500, 500);
camera.lookAt(scene.position);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
window.document.body.appendChild(renderer.domElement);

let light = new THREE.DirectionalLight('white', 1.8);
light.position.set(60, 100, 20);
scene.add(light);

///////////////////////////////////////////////////////////////////////////////
//   MAIN RENDER LOOP
///////////////////////////////////////////////////////////////////////////////

let renderCounter = 0;
let renderLoopMax = Number.MAX_SAFE_INTEGER;
let activeMeshes = [];
let activeMeshProps = [];
let indicesToRemove = [];
let currentMesh;
let currentMeshProps;

// Adds a new mesh every 250 milliseconds
window.setInterval(function(){
  currentMesh = createRandomMesh();
  activeMeshes.push(currentMesh)
  
  currentMeshProps = createRandomMeshProps();
  currentMeshProps.lifespan += renderCounter;
  activeMeshProps.push(currentMeshProps)
  
  scene.add(currentMesh);
  currentMesh.position.set(
    getRandomInt(-300, 300),
    getRandomInt(0, 300),
    getRandomInt(-300, 300)
  );
}, 250);

let render = function() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  
  let cMesh;
  let cMeshProps;
  
  for(let i = 0; i < activeMeshes.length; i++) {
    cMesh = activeMeshes[i]
    cMeshProps = activeMeshProps[i];
    
    if(cMeshProps.isSpinning) {
      cMesh.rotation.x += cMeshProps.rotation.x;
      cMesh.rotation.y += cMeshProps.rotation.y;
      cMesh.rotation.z += cMeshProps.rotation.z;
    }
    if(cMeshProps.isRotating) {
      cMesh.translateX(cMeshProps.translation.x);
      cMesh.translateY(cMeshProps.translation.y);
      cMesh.translateZ(cMeshProps.translation.z);
    }
    if(cMeshProps.isShakey) {
      cMesh.translateOnAxis(_.sample(optsVectors), 3);
    }
    
    cMesh.translateZ(10);
    
    if(cMeshProps.lifespan <= renderCounter) {
      indicesToRemove.push(i);
      console.log(`activeMeshes.length=${activeMeshes.length}, activeMeshProps.length=${activeMeshProps.length}`);
    }
  }
  
  for(let idx of indicesToRemove) {
    scene.remove(scene.getObjectByName(activeMeshes[idx].name));
    activeMeshes = activeMeshes.slice(0, idx).concat(activeMeshes.slice(idx + 1, activeMeshes.length));
    activeMeshProps = activeMeshProps.slice(0, idx).concat(activeMeshProps.slice(idx + 1, activeMeshProps.length));
  }
  
  indicesToRemove = [];
  
  renderCounter++;
  if(renderCounter >= renderLoopMax) {
    renderCounter = 0;
  }
}

render();
