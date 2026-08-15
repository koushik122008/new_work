## 2024-05-14 - GC Pauses from Object Instantiation in Game Loops
**Learning:** Instantiating new objects (like `new THREE.Box3()`) inside high-frequency nested loops (such as collision detection in `updateProjectiles`) causes massive memory allocation overhead and leads to Garbage Collection (GC) pauses, which degrade the framerate in WebGL applications.
**Action:** Always declare reusable instance variables (e.g., `const sharedBox = new THREE.Box3()`) globally or outside the loop and mutate them inside the loop (e.g., `.setFromObject(...)`) to avoid frequent allocations.
## 2024-08-15 - Reuse Geometries and Materials in Three.js
**Learning:** Continuous allocation of geometries and materials without calling `.dispose()` causes memory leaks and GC overhead in Three.js.
**Action:** Always pre-allocate shared geometries and materials once during initialization and reuse them in the game loop to prevent these performance and memory issues.
