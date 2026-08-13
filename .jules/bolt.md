## 2024-05-14 - GC Pauses from Object Instantiation in Game Loops
**Learning:** Instantiating new objects (like `new THREE.Box3()`) inside high-frequency nested loops (such as collision detection in `updateProjectiles`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, which degrade the framerate in WebGL applications.
**Action:** Always declare reusable instance variables (e.g., `const sharedBox = new THREE.Box3()`) globally or outside the loop and mutate them inside the loop (e.g., `.setFromObject(...)`) to avoid frequent allocations.

## 2024-05-15 - GC Pauses from Material and Geometry Allocation in Three.js
**Learning:** Instantiating new materials and geometries inside high-frequency entity spawn functions (like `fireProjectile` or `spawnEnemy`) causes massive memory overhead. `new THREE.MeshStandardMaterial()` and `new THREE.DodecahedronGeometry()` generate entirely new WebGL buffers. When called repeatedly, this overwhelms the Garbage Collector.
**Action:** Pre-allocate shared geometries and materials once during initialization (`init()`), and reuse them when creating new `THREE.Mesh` instances inside the game loop to maintain a stable framerate and avoid memory leaks.
