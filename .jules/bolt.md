## 2024-05-14 - GC Pauses from Object Instantiation in Game Loops
**Learning:** Instantiating new objects (like `new THREE.Box3()`) inside high-frequency nested loops (such as collision detection in `updateProjectiles`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, which degrade the framerate in WebGL applications.
**Action:** Always declare reusable instance variables (e.g., `const sharedBox = new THREE.Box3()`) globally or outside the loop and mutate them inside the loop (e.g., `.setFromObject(...)`) to avoid frequent allocations.

## 2026-08-08 - Pre-allocate Three.js Geometries and Materials
**Learning:** In Three.js, instantiating new Geometries and Materials inside frequent game loops (like firing projectiles or spawning enemies) without calling `.dispose()` leads to rapid WebGL memory leaks and severe Garbage Collection pauses.
**Action:** Always pre-allocate shared geometries and materials once during initialization (`init()`) and reuse them when creating new `THREE.Mesh` instances.
