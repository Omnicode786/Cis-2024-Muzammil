# Assets Directory

This directory contains game assets.

## Textures
Currently, the game uses procedural textures or a simple hardcoded atlas.
To upgrade:
1. Place a `atlas.png` here.
2. Update `TextureManager.cpp` to load this file using a library like `stb_image`.

## Sounds
To add sounds:
1. Add `.wav` files here.
2. Initialize `SDL_Mixer` in `Game.cpp`.
