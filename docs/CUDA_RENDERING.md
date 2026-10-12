# CUDA 3D rendering

OakScript can optionally rasterize its existing built-in 3D geometry on an
NVIDIA GPU using CUDA. Select the backend before creating any windows:

```oak
use_cuda(true)
window "CUDA triangle" 800 600
def draw():(
    clear((20,28,38))
    fill_poly([vec3(-1,-1,0),vec3(1,-1,0),vec3(0,1,0)],(255,140,60))
)
```

`use_cuda()` also enables CUDA. `use_cuda(false)` selects the ordinary backend.
For a program that deliberately supports either backend, use
`use_cuda(cuda_available())`. An explicit CUDA request fails with a diagnostic
if the driver or the active window's NVIDIA GPU is unavailable; it never runs
the CUDA rasterizer on the CPU.

## Requirements and APIs

Windows x64, an NVIDIA CUDA-capable GPU, and a display driver supporting CUDA
12.8 or newer are required by the embedded PTX. The window must run on the
NVIDIA GPU. A positive `cuda_available()` checks driver/device availability;
window creation additionally checks that its OpenGL GPU matches a CUDA device.
The NVIDIA display driver supplies `nvcuda.dll`; users do not install the CUDA
Toolkit or NVRTC to run an Oak program.

| Function | Result |
| --- | --- |
| `cuda_available()` | Boolean driver/device availability |
| `use_cuda(enabled=true)` | Select the backend before windows or native GPU resources exist |
| `graphics_backend()` | `"cuda"`, or `"vulkan"` in the runner / `"opengl"` in a native EXE |
| `cuda_stats()` | `[triangles, batches, geometry_uploads, texture_uploads, kernel_launches, device_name]` for the active window |

`triangles` is the current original triangle count. The other numeric counters
are cumulative per window. Geometry uploads count vertex and index transfers
separately. Ordinary `graphics_stats()` counts presentation resources; use
`cuda_stats()` for CUDA work. Every window owns its CUDA context, presentation
images, depth and geometry resources; existing `set_window()` and input APIs
continue to select the active window.

## What uses CUDA

Built-in filled 3D polygons, meshes, OBJ/glTF/GLB model parts and 3D text pass
through real transform, clipping, tile-binning and pixel-rasterization CUDA
kernels. Camera and object transforms preserve Oak's column-vector convention:
`A * B * vector` applies B first. Textures support perspective-correct UVs,
nearest/linear filtering, clamp/repeat/mirror, mipmaps, and up to 16 anisotropic
samples. RGBA8 compute textures can be used as materials on their owning device.

Depth/culling/blending settings and 2D overlays retain drawing order. Consecutive
3D commands with compatible depth settings share a CUDA batch. Geometry, driver
modules, presentation pipelines and texture registrations are cached. Unchanged
geometry and static textures are not uploaded again. Mipmaps are generated on
the GPU. OpenGL presents the result through CUDA/GL interop: texture copies,
depth copies and rendering remain GPU work, with map/unmap ownership ordering
and no per-frame device-idle wait or CPU pixel readback. Explicit PNG capture
still reads back the requested image.

The existing directional, point and spot lights provide diffuse illumination,
range/cone attenuation and shadows. In CUDA, shadows use GPU triangle visibility
rays, not the ordinary renderer's shadow atlas. `shadow_filter=<hard>` uses one
ray; `<pcf>` uses nine deterministic angular visibility samples. `shadow_bias`
offsets the ray origin in world units. Atlas-specific `shadow_extent` and
`shadow_near` have no effect in CUDA. This produces somewhat different shadow
edges/bias behavior from Vulkan/OpenGL shadow-map filtering.

## Native compilation

```powershell
oakscript compile examples/cuda-3d.oak -o cuda-3d.exe
./cuda-3d.exe
```

The compiler emits direct C++20 runtime calls and embedded PTX. Its EXE contains
no Oak interpreter, bytecode VM, .NET runtime, NVRTC or CUDA Toolkit packages.
Ordinary external textures, models and fonts still need their usual asset paths.
The runner embeds its small CUDA driver bridge and extracts it to its versioned
local cache; native EXEs compile the same driver host directly into the program.

## Limits

CUDA is optional; the default runner remains Vulkan and the default native EXE
remains OpenGL. 2D and presentation still use OpenGL when CUDA is selected.
Custom SPIR-V vertex/fragment shaders cannot execute as CUDA kernels and are
rejected for CUDA 3D draws. General `dispatch()` still uses the ordinary GPU
compute API. Raygame's custom compute path tracer therefore does not become a
CUDA path tracer by calling `use_cuda(true)`. Its existing compute shaders do
work through the OpenGL presentation device. Version 0.8.1 fixes compute
buffer/image binding names for this path, including mixed resource layouts.

This is a rasterizer, not RTX/OptiX ray tracing or a physically based renderer.
There is no BVH for shadow rays yet; shadow cost grows with visible pixels,
lights, shadow samples and scene triangles. Dense scenes can use the default
shadow-map renderer. CUDA is not guaranteed faster for every program; GPU
ownership handoffs and host byte comparisons have a cost. Hardware MSAA,
custom CUDA kernels and arbitrary material shaders are not exposed. Mip/aniso
filtering approximates hardware filtering. Automated resize checks passed on
both backends; physical resize/minimize and
non-NVIDIA error paths need separate machines/manual validation.

## Rebuilding and checking

`tooling/build-cuda.ps1` regenerates PTX and the embedded driver bridge. It needs
Python and MinGW-w64 C++20. When absent, it downloads NVIDIA's build-only NVRTC
12.8.93 archive and verifies the published SHA-256. Compiler DLLs stay under
`artifacts/cuda-toolchain`; they are never included in the distribution. Normal
`build.ps1` uses the already generated PTX/bridge. `build.ps1 -Cuda` regenerates
them first.

`python tooling/verify-cuda.py` performs actual GPU captures through both the
packaged runner and a separately compiled EXE, checks known pixel results,
lighting/shadows, native parity and static resource reuse. Reports and images
are saved under `artifacts/cuda-rendering`. `tooling/verify-cuda-integration.py`
also checks manual rendering/exit capture, explicit errors, dynamic compute
textures and 3D text in isolated runner/native processes.

The implementation follows NVIDIA's [graphics interop ownership rules](https://docs.nvidia.com/cuda/cuda-programming-guide/04-special-topics/graphics-interop.html)
and uses the [CUDA Driver API](https://docs.nvidia.com/cuda/cuda-driver-api/cuda_driver_api/group__CUDA__GL.html).

`tooling/verify-raygame-cuda.py --native` checks mixed named buffer/image
bindings, changing inputs, empty-resource shaders, and Raygame accumulation
and image parity with CUDA selected or the default backend selected.
