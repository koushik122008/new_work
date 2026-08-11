## 2024-05-14 - GC Pauses from Object Instantiation in Game Loops
**Learning:** Instantiating new objects (like `new THREE.Box3()`) inside high-frequency nested loops (such as collision detection in `updateProjectiles`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, which degrade the framerate in WebGL applications.
**Action:** Always declare reusable instance variables (e.g., `const sharedBox = new THREE.Box3()`) globally or outside the loop and mutate them inside the loop (e.g., `.setFromObject(...)`) to avoid frequent allocations.
## 2026-08-11 - Pre-allocating Geometries and Materials in Three.js
**Learning:** Continuously allocating geometries and materials (like `new THREE.DodecahedronGeometry()` or `new THREE.MeshStandardMaterial()`) in high-frequency functions such as `spawnEnemy` or `fireProjectile` causes memory and GPU resource leaks in Three.js without explicit `.dispose()` calls, degrading framerate and causing GC pauses.
**Action:** Lazily initialize and reuse shared instances of geometries and materials across multiple meshes to prevent redundant allocations and resource leaks.
