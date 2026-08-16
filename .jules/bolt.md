## 2024-05-14 - GC Pauses from Object Instantiation in Game Loops
**Learning:** Instantiating new objects (like `new THREE.Box3()`) inside high-frequency nested loops (such as collision detection in `updateProjectiles`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, which degrade the framerate in WebGL applications.
**Action:** Always declare reusable instance variables (e.g., `const sharedBox = new THREE.Box3()`) globally or outside the loop and mutate them inside the loop (e.g., `.setFromObject(...)`) to avoid frequent allocations.

## 2026-08-16 - Prevent GC Pauses with Shared Geometries and Materials
**Learning:** Instantiating new objects (like `new THREE.MeshStandardMaterial()` and `new THREE.DodecahedronGeometry()`) inside high-frequency nested loops or functions that run frequently (such as `spawnEnemy` or `fireProjectile`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, degrading framerate.
**Action:** Always pre-allocate reusable geometries and materials globally during initialization, and reuse them inside the game loop to prevent GC pauses.
