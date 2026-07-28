## 2026-07-28 - [Three.js Resource Leaks]
**Learning:** Continuous allocation of geometries and materials (e.g. `new THREE.Geometry()`) in rapid functions like `spawnEnemy()` or `fireProjectile()` without calling `.dispose()` causes severe memory and GPU resource leaks in Three.js applications.
**Action:** Always pre-allocate shared geometries and materials once during initialization and reuse them in the game loop to prevent resource leaks.
