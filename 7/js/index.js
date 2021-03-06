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
    transparent: true,
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
  nuMesh.castShadow = true;
  nuMesh.receiveShadow = false; //default
  
  return nuMesh;
}

const createRandomMeshWrapper = () => {
  const opacityP = getRandomInt(3, 6);

  const meshWrapper = {
    timeCreated: Date.now() / 1000,
    mesh: createRandomMesh(),
    rotation: {
      x: _.sample(optsRotation),
      y: _.sample(optsRotation),
      z: _.sample(optsRotation),
    },
    translation: _.sample(optsTranslation),
    isShakey: _.sample([true, false]),
    isSpinning: _.sample([true, false]),
    isRotating: _.sample([true, false]),
    opacityPeriod: opacityP,
    lifespan: opacityP * _.sample([2, 4]),
  };

  if(!meshWrapper.isShakey && !meshWrapper.isSpinning && !meshWrapper.isRotating) {
    meshWrapper.isRotating = true;
  }

  meshWrapper.mesh.material.opacity = 0;

  return meshWrapper;
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
camera.position.set(100, 200, 500);
camera.lookAt(scene.position);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

window.document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(1000, 1000);

const plane1 = new THREE.Mesh(
  geometry,
  new THREE.MeshBasicMaterial({
    color: 'red',
    side: THREE.DoubleSide,
    opacity: 0.1,
    transparent: true,
  }),
);
plane1.receiveShadow = true;

// plane1.rotateX(Math.PI / 2);
const plane2 = new THREE.Mesh(
  geometry,
  new THREE.MeshBasicMaterial({
    color: 'blue',
    side: THREE.DoubleSide,
    opacity: 0.1,
    transparent: true,
  }),
);
plane2.receiveShadow = true;
plane2.rotateX(Math.PI / 2);

const plane3 = new THREE.Mesh(
  geometry,
  new THREE.MeshBasicMaterial({
    color: 'green',
    side: THREE.DoubleSide,
    opacity: 0.1,
    transparent: true,
  }),
);
plane3.receiveShadow = true;
plane3.rotateY(Math.PI / 2);

scene.add(plane1);
scene.add(plane2);
scene.add(plane3);

let light = new THREE.DirectionalLight('white', 1.8);
light.position.set(0, 1, 0);
light.castShadow = true;
scene.add(light);
light.shadow.mapSize.width = 512;  // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5;    // default
light.shadow.camera.far = 500;     // default

///////////////////////////////////////////////////////////////////////////////
//   MAIN RENDER LOOP
///////////////////////////////////////////////////////////////////////////////

let renderCounter = 0;
let renderLoopMax = Number.MAX_SAFE_INTEGER;
let activeMeshes = [];
let indicesToRemove = [];
let currentMeshProps;

// Adds a new mesh every 200 milliseconds
window.setInterval(function() {
  currentMeshWrapper = createRandomMeshWrapper();
  // currentMeshWrapper.lifespan += renderCounter;
  activeMeshes.push(currentMeshWrapper)

  scene.add(currentMeshWrapper.mesh);
  currentMeshWrapper.mesh.position.set(
    getRandomInt(-300, 300),
    getRandomInt(0, 300),
    getRandomInt(-300, 300)
  );
}, 300);


window.setInterval(function() {
  for(let i = 0; i < activeMeshes.length; i++) {
    const cMesh = activeMeshes[i];
    const timeSinceCreation = (Date.now() / 1000) - cMesh.timeCreated;

    const period = cMesh.opacityPeriod;
    cMesh.mesh.material.opacity = periodicFunction(timeSinceCreation, period, 0, 1);

    if(timeSinceCreation > cMesh.lifespan) {
      console.log(`timeSinceCreation=${timeSinceCreation}, cMesh.lifespan=${cMesh.lifespan}, cMesh.opacityPeriod=${cMesh.opacityPeriod}, cMesh.mesh.material.opacity=${cMesh.mesh.material.opacity}`);
      indicesToRemove.push(i);
    }
  }

  for(let idx of indicesToRemove) {
    scene.remove(scene.getObjectByName(activeMeshes[idx].mesh.name));
    activeMeshes = activeMeshes.slice(0, idx).concat(activeMeshes.slice(idx + 1, activeMeshes.length));
  }
  
  indicesToRemove = [];
  console.log(`activeMeshes.length=${activeMeshes.length}`);
}, 16.6666667);

let render = function() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  
  let cMesh;
  // let cMeshProps;
  
  for(let i = 0; i < activeMeshes.length; i++) {
    cMesh = activeMeshes[i];
    
    if(cMesh.isSpinning) {
      cMesh.mesh.rotation.x += cMesh.rotation.x;
      cMesh.mesh.rotation.y += cMesh.rotation.y;
      cMesh.mesh.rotation.z += cMesh.rotation.z;
    }
    if(cMesh.isRotating) {
      cMesh.mesh.translateX(cMesh.translation.x);
      cMesh.mesh.translateY(cMesh.translation.y);
      cMesh.mesh.translateZ(cMesh.translation.z);
    }
    if(cMesh.isShakey) {
      cMesh.mesh.translateOnAxis(_.sample(optsVectors), 3);
    }

    cMesh.mesh.translateZ(5);
  }

  for(let idx of indicesToRemove) {
    const cMesh = activeMeshes[idx];
    cMesh.mesh.material.opacity = 0;
    cMesh.mesh.visible = false;
  }
  
  renderCounter++;
  if(renderCounter >= renderLoopMax) {
    renderCounter = 0;
  }
}

render();
