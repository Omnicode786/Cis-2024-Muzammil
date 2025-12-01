# Engine Architecture

## Core Components

### Game Loop (`Game.cpp`)
Manages the SDL window, processes input events, and runs the main loop (Update -> Render).

### Renderer (`Renderer.cpp`)
Handles OpenGL context, shader compilation, and drawing.
- **Shaders**: Basic vertex/fragment shaders for block rendering.
- **Camera**: Handles view/projection matrices.

### World System (`World.cpp`, `Chunk.cpp`)
- **World**: A collection of `Chunks`. Handles global operations like "GetBlockAt(x,y,z)".
- **Chunk**: A 16x16x16 (or similar) volume of blocks.
  - **Data**: 1D array of bytes for cache efficiency.
  - **Mesh**: Generated only when dirty. Uses **Greedy Meshing** (simplified) or **Face Culling** (only draw faces touching air).

### Player (`Player.cpp`)
- **Physics**: AABB (Axis-Aligned Bounding Box) collision against the World.
- **Input**: Maps SDL events to movement vectors.

## Data Formats
- **Save File**: Simple binary dump of block IDs.
    - Header: `MAGIC ("VOXL")`, `Version`, `WorldSize`
    - Body: RLE (Run-Length Encoded) or raw block data.

## Future Upgrades
- **Lighting**: Add a light level array to Chunks. Propagate light using BFS. Pass light level to shader.
- **Infinite World**: Implement `ChunkManager` to load/unload chunks based on player distance.
