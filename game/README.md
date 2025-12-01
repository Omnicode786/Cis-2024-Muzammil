# C++ Minecraft Game Kit

A modular, C++17 voxel sandbox engine using SDL2 and OpenGL.

## Features
- **Voxel World**: 3D chunk-based terrain with random generation.
- **Rendering**: Optimized face-culling mesh generation.
- **Interaction**: Place and break blocks, basic physics, collision.
- **Systems**: Save/Load support, simple mob stub, day/night cycle stub.
- **Cross-Platform**: Runs on Windows, Linux, and macOS.

## Prerequisites
- **C++ Compiler** (GCC, Clang, or MSVC) supporting C++17.
- **CMake** (3.10+)
- **SDL2** (Development libraries)
- **OpenGL** (Drivers usually installed by default)

## Build Instructions

### Linux (Debian/Ubuntu)
```bash
sudo apt-get install libsdl2-dev cmake g++
mkdir build && cd build
cmake ..
make
./CppMinecraftKit
```

### macOS
```bash
brew install sdl2 cmake
mkdir build && cd build
cmake ..
make
./CppMinecraftKit
```

### Windows (MSYS2/MinGW)
```bash
pacman -S mingw-w64-x86_64-sdl2 mingw-w64-x86_64-cmake mingw-w64-x86_64-gcc
mkdir build && cd build
cmake -G "MinGW Makefiles" ..
mingw32-make
./CppMinecraftKit.exe
```

### Windows (Visual Studio)
1. Open the folder in Visual Studio.
2. Ensure "C++ CMake tools for Windows" is installed.
3. Visual Studio should auto-detect CMakeLists.txt.
4. Select configuration (x64-Debug/Release) and build.

## Controls
- **WASD**: Move
- **Space**: Jump
- **Mouse**: Look
- **Left Click**: Break Block
- **Right Click**: Place Block
- **1-9**: Select Block Type
- **F5**: Save World
- **F6**: Load World
- **Esc**: Quit

## Troubleshooting
- **"SDL2 not found"**: Ensure SDL2 development libraries are installed and in your PATH or CMAKE_PREFIX_PATH.
- **"OpenGL error"**: Update graphics drivers.
