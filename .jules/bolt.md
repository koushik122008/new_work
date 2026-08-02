## 2024-05-18 - Three.js Object Allocation
**Learning:** Instantiating `THREE.Geometry` (or `BufferGeometry`) and `THREE.Material` objects repeatedly inside a render or physics loop (e.g., when firing projectiles or spawning enemies) creates severe memory leaks and garbage collection stutters in this codebase, as these objects are not automatically disposed of by the engine.
**Action:** Always pre-allocate shared geometries and materials once during initialization (`init()`) and reuse them across instances (`THREE.Mesh`) during gameplay.
