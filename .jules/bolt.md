## 2026-07-27 - Pre-allocating Geometries and Materials in Three.js
**Learning:** Instantiating new `Geometry` and `Material` objects on high-frequency events (like spawning enemies or firing projectiles) causes memory leaks and GC pauses in Three.js if not disposed properly.
**Action:** Always pre-allocate shared geometries and materials once during initialization (e.g., in the `init()` function) and reuse them in the main game loop.
