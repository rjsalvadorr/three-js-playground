class RjMesh {
  constructor(mesh, lifespan, options) {
    this.mesh = mesh;
    // if !lifespan, initialize to 259200 seconds (3 days)
    this.lifespan = lifespan || 259200;
    this.options = options || {};
    
    this.timeCreated = Date.now() / 1000;
    this.timeExpiry = this.timeCreated + lifespan;
    this.alive = true;
  }

  applyMovements() {
    // console.log(this);
    if(this.options.transforms) {
      const currentTime = Date.now() / 1000;
      for(let func of this.options.transforms) {
        func(this.mesh, this.options);
      }
    }
  }

  update() {
    if(Date.now() / 1000 > this.timeExpiry) {
      this.alive = false;
    }
  }

  pull(rjMesh, distance = 0) {
    // the condition avoids pulling the other mesh to the exact same position
    if(rjMesh.mesh.position.distanceTo(this.mesh.position) > 6) {
      const direction = new THREE.Vector3();
      direction.subVectors(this.mesh.position, rjMesh.mesh.position);
      const local = rjMesh.mesh.worldToLocal(direction);
      rjMesh.mesh.translateOnAxis(local.normalize(), distance);
    }
  }

  push(rjMesh, distance = 0) {
    const direction = new THREE.Vector3();
    direction.subVectors(this.mesh.position, rjMesh.mesh.position);
    const local = rjMesh.mesh.worldToLocal(direction);
    rjMesh.mesh.translateOnAxis(local.normalize().negate(), distance);
  }
}
