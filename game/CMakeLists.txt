cmake_minimum_required(VERSION 3.10)
project(CppMinecraftKit VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# --- Dependencies ---
find_package(SDL2 REQUIRED)
find_package(OpenGL REQUIRED)

# --- Sources ---
file(GLOB_RECURSE SOURCES "src/*.cpp")
file(GLOB_RECURSE HEADERS "include/*.h")

# --- Executable ---
add_executable(${PROJECT_NAME} ${SOURCES} ${HEADERS})

# --- Include Directories ---
target_include_directories(${PROJECT_NAME} PRIVATE include)
target_include_directories(${PROJECT_NAME} PRIVATE ${SDL2_INCLUDE_DIRS})

# --- Linking ---
target_link_libraries(${PROJECT_NAME} PRIVATE ${SDL2_LIBRARIES} ${OPENGL_LIBRARIES})

if(WIN32)
    # Link against standard windows libs if needed, usually SDL handles this
    # target_link_libraries(${PROJECT_NAME} PRIVATE mingw32 SDL2main SDL2) 
    # The above line depends on how SDL2 is found. 
    # If using standard FindSDL2, ${SDL2_LIBRARIES} should contain SDL2main and SDL2.
endif()

# --- Assets Copy (Optional but good for portability) ---
file(COPY assets DESTINATION ${CMAKE_BINARY_DIR})

message(STATUS "Build setup complete for ${PROJECT_NAME}")
