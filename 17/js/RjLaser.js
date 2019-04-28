class RjLaser {
  constructor(mesh, startPos, direction, velocity, acceleration) {
    this.mesh = mesh;
    this.startPos = startPos;
    this.direction = direction;
    this.velocity = velocity || 1;
    this.acceleration = acceleration || 1;

    this.mesh.position.set(startPos.x, startPos.y, startPos.z);
    this.mesh.lookAt(this.direction);
  }

  shoot(dist = 10) {
    this.mesh.translateZ(dist);
  }
}
