## 2024-07-26 - [Three.js Geometry and Material Allocation Loop]
**Learning:** In Three.js, instantiating new geometries and materials repeatedly in the render or game loop (e.g., `spawnEnemy` and `fireProjectile`) without explicitly calling `.dispose()` causes severe memory and GPU resource leaks, leading to garbage collection pauses and WebGL context exhaustion.
**Action:** Always pre-allocate shared geometries and materials once during initialization, and pass them to newly created meshes in the game loop.
