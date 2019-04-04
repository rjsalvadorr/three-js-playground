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

  update() {
    if(Date.now() / 1000 > timeExpiry) {
      this.alive = false;
    }
  }
}
