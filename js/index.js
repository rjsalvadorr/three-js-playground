const NUM_OBJECTS = 30;

let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera(
  window.innerWidth / -2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  window.innerHeight / -2,
  1,
  2000
);
camera.position.set(0, 1000, 1000);
camera.lookAt(scene.position);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
window.document.body.appendChild(renderer.domElement);

const geometry1 = new THREE.ConeGeometry(30, 60, 40);
const geometry2 = new THREE.BoxGeometry(50, 60, 40);
const geometry3 = new THREE.IcosahedronGeometry(20, 0);
const geometry4 = new THREE.CylinderGeometry( 10, 10, 20, 32 );
const geometry5 = new THREE.SphereGeometry( 15, 32, 32 );
const geometry6 = new THREE.DodecahedronGeometry(20, 0);
const optsGeometry = [geometry1, geometry2, geometry3, geometry4, geometry5, geometry6];

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

let newMesh;
let newProps;
let randomGeometry;
let randomMaterial;

const createMeshes = () => {
  const meshes = [];
  
  for(let i = 0; i < NUM_OBJECTS; i++) {
    randomGeometry = _.sample(optsGeometry);
    randomMaterial = _.sample(optsMaterial);
    newMesh = new THREE.Mesh(randomGeometry, randomMaterial);

    newMesh.rotation.x = THREE.Math.degToRad(_.sample([15, 20, 5, 0]));
    newMesh.rotation.y = THREE.Math.degToRad(_.sample([30, 25, 45, 5]));
    newMesh.name = `mesh${i}`
    
    meshes.push(newMesh);
  }
  
  return meshes;
}

const createMeshProps = () => {
  const meshProps = [];
  
  for(let i = 0; i < NUM_OBJECTS; i++) {
    newProps = {
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

    if(!newProps.isShakey && !newProps.isSpinning && !newProps.isRotating) {
      newProps.isRotating = true;
    }

    meshProps.push(newProps);

    console.log(newProps)
  }
  
  return meshProps;
}
  
let light = new THREE.DirectionalLight('white', 1.8);
light.position.set(60, 100, 20);
scene.add(light);

const meshes = createMeshes();
const meshProps = createMeshProps();

let renderCounter = 0;
let renderLoopMax = Number.MAX_SAFE_INTEGER;
let activeMeshes = [];
let activeMeshProps = [];
let indicesToRemove = [];
let currentMesh;
let currentMeshProps;

let render = function() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  
  if(renderCounter % 8 === 0) {
    currentMesh = _.sample(meshes).clone();
    currentMesh.name = `mesh${renderCounter}`
    activeMeshes.push(currentMesh)
    
    currentMeshProps = _.cloneDeep(_.sample(meshProps));
    currentMeshProps.lifespan += renderCounter;
    activeMeshProps.push(currentMeshProps)
    
    scene.add(currentMesh);
  }
  
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
    
    cMesh.translateZ(-10);
    
    if(cMeshProps.lifespan <= renderCounter) {
      indicesToRemove.push(i);
    }
  }
  
  console.log(`${renderCounter}, ${activeMeshes.length}, ${activeMeshProps.length}, ${indicesToRemove.length}`);
  
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