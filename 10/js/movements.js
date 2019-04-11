const rjMovements = {
  shake: function(mesh, options) {
    mesh.translateOnAxis(getRandomVector(), 0.5);
  },
  move: function(mesh, options) {
    mesh.translateOnAxis(options.direction, 2);
  },
  spin: function(mesh, options) {
    mesh.rotateOnWorldAxis(options.rotationAxis, Math.PI / 24);
  },
}
