const rjTransforms = {
  shake: function(mesh, options) {
    mesh.translateOnAxis(getRandomVector(), 0.5);
  },
  move: function(mesh, options) {
    const localAxis = mesh.worldToLocal(options.direction);
    mesh.translateOnAxis(localAxis, 2);
  },
  spin: function(mesh, options) {
    mesh.rotateOnWorldAxis(options.rotationAxis, Math.PI / 16);
  },
  pulseColour: function(mesh, options) {
    const currentTime = Date.now() / 1000;
    const colorScale = chroma.scale(['49a7c4', 'bdddff']);
    const scaleVal = periodicFunction(currentTime, 3, 0, 1);
    mesh.material.color.set(colorScale(scaleVal).hex());
  },
  fadeInOut: function(mesh, options) {
    const currentTime = Date.now() / 1000;
    const scaleVal = periodicFunction(currentTime, 3, 0.8, 1);
    mesh.material.opacity = scaleVal;
  }
}
