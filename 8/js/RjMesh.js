class RjMesh {
  constructor(mesh, opacityPeriod, lifespan) {
    this.mesh = mesh;
    this.opacityPeriod = opacityPeriod ? opacityPeriod : 0;
    // if !lifespan, initialize to 259200 seconds (3 days)
    this.lifespan = lifespan ? lifespan : 259200;
    
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
