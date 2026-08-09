## 2024-05-14 - GC Pauses from Object Instantiation in Game Loops
**Learning:** Instantiating new objects (like `new THREE.Box3()`) inside high-frequency nested loops (such as collision detection in `updateProjectiles`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, which degrade the framerate in WebGL applications.
**Action:** Always declare reusable instance variables (e.g., `const sharedBox = new THREE.Box3()`) globally or outside the loop and mutate them inside the loop (e.g., `.setFromObject(...)`) to avoid frequent allocations.

## 2024-05-15 - Shared Geometries and Materials
**Learning:** In Three.js, instantiating new Geometries and Materials inside a frequent event (like firing projectiles or spawning enemies) severely degrades performance via garbage collection pauses and VRAM overallocation.
**Action:** Always pre-allocate Geometries and Materials during initialization and pass them directly into `new THREE.Mesh(sharedGeo, sharedMat)` to maximize re-use.
