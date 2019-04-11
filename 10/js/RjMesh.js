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
    console.log(this);
    if(this.options.movements) {
      const currentTime = Date.now() / 1000;
      for(let func of this.options.movements) {
        func(this.mesh, this.options);
      }
    }
  }

  update() {
    if(Date.now() / 1000 > timeExpiry) {
      this.alive = false;
    }
  }
}
