class RjLaser {
  constructor(mesh, startPos, direction, velocity, acceleration) {
    this.mesh = mesh;
    this.startPos = startPos;
    this.direction = direction;
    this.velocity = velocity || 1;
    this.acceleration = acceleration || 1;

    this.timeCreated = Date.now() / 1000;
    this.timeExpiry = this.timeCreated + 0.9; // lifespan of 3 seconds
    this.alive = true;

    this.mesh.position.set(startPos.x, startPos.y, startPos.z);
    this.mesh.lookAt(this.direction);
  }

  update() {
    if(this.alive) {
      this.mesh.translateZ(this.velocity);
      const currentTime = Date.now() / 1000;

      if(currentTime > this.timeExpiry) {
        this.alive = false;
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh = null;
        // console.log('disposed of mesh!');
      }
    }
  }

  resetMesh(newMesh) {

  }
}
