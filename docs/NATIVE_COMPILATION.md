# Native compilation

OakScript 0.9.0 compiles CPU, 2D/3D graphics, audio and GPU compute programs to
standalone Windows x64 machine code.

```powershell
oakscript compile program.oak -o program.exe
./program.exe "quoted argument"
oakscript compile cubesgameti/cubesgameti.oak --libpath . -o cubesgameti.exe
oakscript compile examples/native-features.oak -o features.exe
```

The compiler checks the complete import graph, lowers Oak statements directly
to C++20 functions and control flow, and invokes MinGW-w64 GCC. The executable
contains no Oak parser, AST, encoded program, bytecode VM, Oak interpreter, CLR,
or .NET/graphics packages. Compiled value, collection, audio and GPU routines are
native runtime support. SPIRV-Cross translates GPU shader binaries to driver
GLSL; it does not interpret Oak programs.

## Building and distributing

Install MinGW-w64 GCC with C++20 support and static runtime libraries. Select
`g++` through PATH, `--compiler C:/msys64/mingw64/bin/g++.exe`, or `OAKSCRIPT_CXX`.
GCC is needed only on the build computer. The compiled program needs neither
GCC, OakScript nor .NET. This backend targets Windows x64 using baseline x64
instructions. The default optimization is GCC `-O3`; `compile --no-opt` selects
`-O0`. Unsupported constructs fail explicitly without an interpreter fallback.

Imports use direct paths, `oaklibraries.json`, local files, `--libpath` and
installed packages. Interactive missing imports prompt; batch builds report
searched paths. See [library paths](LIBRARY_PATHS.md).

`--emit-cpp FILE.cpp` writes generated code and every required support source
beside it. Failed checks/compiler invocations preserve an existing output EXE.
GPU shader builds cache the compiled SPIRV-Cross support object under
`%LOCALAPPDATA%/OakScript/native-cache`; the cache key includes source bytes,
compiler identity and build flags. This cache is used on the build machine only.
For a manual rebuild, compile the emitted program with C++20, `-municode`,
`-Wa,-mbig-obj` (large COFF objects for unoptimized graphics builds), static
GCC/C++ runtime flags, and the emitted `spirv_cross.cpp`, `spirv_parser.cpp`,
`spirv_cross_parsed_ir.cpp`, `spirv_cfg.cpp`, `spirv_glsl.cpp` when present.
Graphics links `opengl32`, `gdi32`, `user32`; audio links `winmm`.

Relative asset/file operations resolve beside the compiled EXE. Module
subdirectories within the entry project are retained. Copy images, fonts,
models, shader binaries and WAV files to these directories. Imported Oak source
files are unnecessary at execution time. Text files use UTF-8; diagnostics
retain source filenames, lines and columns without needing those source files.
The distribution includes GCC, MinGW and vendored dependency license notices.

## CPU and language features

- Checked signed 64-bit `int`, finite `float`, `bool`, `null`, strings, lists,
  tuples, bytes, bytearrays, ranges, dictionaries, sets and frozensets.
- Typed/inferred variables, fractional multiplication, exponentiation, floor
  division, bitwise operators, comparisons/chains, membership and Boolean
  short circuiting. Reference identity works for reference values and `null`;
  scalar boxing identity is not provided by this native value representation.
- `if`/`elif`/`else`, `while`, `for`, `break`, `continue`, assignment and return.
  Known scalar operations lower to typed native arithmetic; eligible range
  loops lower to native loop counters.
- Nominal records, per-instance defaults, readonly/typed fields, nested tuple
  initialization, attribute schemas, extensible nominal option sets and aliases.
- `dir(value)` and `opt_dir(value,"attribute")` reflection. Option inspection
  uses the same built-in attribute schemas as the runner and includes inherited
  fields, extended custom option sets and typed module exports. It returns sorted
  names without invoking attribute getters; ordinary attributes return `[]` and
  unknown attributes raise `TypeError`. See [attribute options](../examples/attribute-options.oak).
  Records can store functions with per-instance lexical state; see
  [record functions](../examples/record-functions.oak). User-defined types also
  support bound instance methods, static/class methods, properties, custom
  `def @init`/`def @new`, dynamic attributes, nested types, C3 multiple inheritance
  and `super()`. Operator, conversion, call, hash, iterator, item/slice, context
  and descriptor hooks use the same `@name` syntax in both backends.
  Reflection includes `type`, dynamic `type(name,bases,dict)`, `vars`, `repr`,
  `hash`, attribute helpers and instance/subclass checks. See
  [type classes](../examples/type-classes.oak), [protocols](../examples/type-protocols.oak),
  [inheritance](../examples/type-inheritance.oak), [reflection](../examples/type-reflection.oak),
  and [conversions](../examples/type-conversions.oak).
- First-class, recursive, nested functions; retained lexical closures; lambdas;
  decorators; defaults evaluated once; keyword-only parameters; typed `*args`
  and `**kwargs`; positional and keyword expansion.
- Mapping/set literals and expansions, all current dictionary/set methods,
  structural equality, immutable hash keys, insertion-ordered dictionary keys,
  list/set/dict comprehensions, nested/unpacking loops and starred assignments.
- Indexing, UTF-16 strings, string/list/tuple/bytes/bytearray slices, reversal,
  range slicing, mutable sequence index/slice assignment and `del`.
- Lazy generators and generator expressions compiled to C++ coroutine frames;
  `yield`, `yield from`, exhaustion, close and cleanup. Iterator helpers:
  `iter`, `next`, `close`, `enumerate`, `zip`, `map`, `filter`, `reversed`,
  `sum`, `all`, `any`. Custom record iteration protocols are supported.
- Recoverable `try`/`except`/`else`/`finally`, exception families, custom
  `exception_type`, `raise`, bare re-raise, and record context managers with
  `with`. Cleanup handles return, break, continue and generator close.
- `dir` for attributes/fields/methods and module exports. `.format` supports
  automatic/numeric fields, named fields and escaped braces. `%s`/`%%` accepts
  single values or tuples. Custom object `@format` specifications are supported; advanced built-in format
  specifications remain unsupported.
- Checked imports and aliases, live module values, shared imported bindings,
  initialization once, `__init__`/`__dispose__` hooks and generator cleanup.
- Only the entry file's own `__main__` runs automatically, after top-level code.
  `main` remains ordinary; arguments and integer process exit codes are supported.
- Console, file and scalar math helpers already supported by the compiler.

Matrices retain row-major storage and **column-vector multiplication**:
`A * B * vector` applies B then A. Vector/matrix assignment copies components.
Native math includes float/integer vectors, mat2/3/4, quaternion x/y/z/w ordering,
dot/cross/length/normalize/transpose, transform helpers, inverse/determinant,
perspective/orthographic/look-at, rotation matrices, practical TRS decomposition,
quaternion multiplication/normalization/inverse/conjugate/vector rotation,
interpolation, Euler/axis-angle and matrix conversions. Angles are in degrees.

## Graphics, windows and shaders

The native backend uses Win32 and hardware OpenGL. The ordinary file runner
continues using Vulkan. Native 3D/custom shaders/compute require an OpenGL 4.3
GPU driver; Windows' GDI software renderer is rejected.

`use_render(True)` enables a persistent manual buffer for the active window.
`render_screen()` applies queued drawing, presents it, and pumps input even
inside a long top-level loop. `use_buffer()` reads the mode; `use_render(False)`
returns to the automatic frame loop. The native backend keeps an actual GPU
framebuffer per window and blits it to presentation, without CPU image copies.

Custom fragment shader translation preserves Oak's vertical screen derivatives,
including `dFdy`, `dFdyFine` and `dFdyCoarse`. Derivative-based face normals and
lighting therefore retain the same direction as in the Vulkan runner. Verify
this with `python tooling/verify-native-shading.py` (requires Pillow, the native
compiler toolchain, `glslc` and a graphics driver supporting both backends).

Supported APIs include window declarations, per-frame `draw` and `delta_time`,
clear, batched single screen pixels with `set_pixel(x,y,color)`, polygon
outlines/filling, overloaded 2D/3D `fill_poly`, vertex/mesh
construction, OBJ/basic MTL and static glTF/GLB models, textures, texture regions,
materials, camera transforms, blend/depth/cull state, and SPIR-V custom shaders.
The existing static model subset does not include skins, animations, morphs,
sparse accessors or compressed geometry. Roughness/metallic are metadata;
the built-in shader uses diffuse lighting, not a complete PBR material model.

Font support includes 2D and 3D text, measurement, kerning, Unicode glyphs,
spacing, line spacing, wrapping, alignment, rotation, scale, opacity,
billboarding and optional depth testing. Glyph textures are cached.

`create_window`, `active_window`, `set_window`, `window_open`, `windows` and
optional-handle `close_window` expose multiple windows. Each owns its context,
presentation/back buffer, render queue, camera/lights and input state; shareable
GPU resources are shared. Keys/buttons expose held/pressed/released state;
mouse position, delta, wheel, locking, window size and focus are available.

Directional, point and spot light objects use existing properties and named
attribute options. Shadows render real GPU depth maps and sample them in the
lighting shader. Directional/spot lights use one face; point lights use six.
Depth bias and hard/3x3 PCF filtering are supported. A window supports 16 lights
and 32 shadow faces. The depth atlas is 4096x2048 with 512x512 faces. Unchanged
caster geometry/transforms and light matrices reuse the previous shadow maps.

Mesh/index data, decoded textures, shader programs and sampler settings are
cached. Native rendering has no per-frame idle wait or unconditional GPU
readback. Explicit captures/readbacks and `compute_wait` may synchronize.
`graphics_stats` reports frames, buffer uploads, texture uploads, program count,
OpenGL descriptor count (zero), and shadow passes.

Native graphics executables accept `--oak-frames N` and `--oak-capture PNG`.
These controls are removed from script arguments. A capture defaults to one
frame. Native CPU program arguments remain unchanged.
Native graphics EXEs also accept `--nowindimlim` to bypass Oak's default 16384-pixel
window dimension cap. It takes no value and is consumed by the runtime. Dimensions
must remain positive 32-bit integers and fit the GPU texture/viewport limits;
Windows preview sizing and available GPU memory still constrain what can run.
Use `--oak-frames -1 --oak-capture failure.png` to run without a frame limit and
capture the first window's full current canvas only after explicit `exit(1)`.
Pending draws are completed even without an earlier presentation.
GPU readback and PNG writing are synchronous: every current canvas pixel is saved
before the process exits. Capture does not resume code after exit(1).
Returning 1 from the entry function, runtime errors and ordinary window close do not request
a screenshot. Other exits preserve any existing output file. Programs with no
window produce no screenshot; capture failures preserve the original exit code.
Oversized canvases retain the requested resolution on the GPU while the visible
window shows a filtered preview with the correct aspect ratio, anchored at (0,0)
in the top-left corner. Unused space is on the right or bottom. Screenshots
include the full canvas with original pixel values. GPU mipmaps are refreshed
when the canvas changes and reused for held images. mouse_position() maps the
preview rectangle back to canvas coordinates, including values outside its margins.

## Audio and compute

General-purpose audio is independent of windows/games. Native WAV loading
supports PCM 8/16/24/32-bit and float32, mono/stereo, looping, pause/resume/stop,
volume, pitch, pan, 3D listener/positional sound and inverse/linear/no attenuation.
Music uses bounded streaming pages. Buses support volume/mute/routing with cycle
checks. Output uses Windows waveOut at 48 kHz stereo.

Native compute loads existing `.comp.spv` shaders, reflects set-zero sequential
bindings, creates float/int/uint storage buffers and rgba8/r32f storage images,
validates writes/readbacks and dispatch, and inserts GPU memory barriers.
`compute_texture` shares GPU image storage directly; `snapshot_texture` performs
an explicit copy/readback. Saving PNGs and explicit `compute_wait` are supported.
The existing compute subset excludes sampled textures, uniforms, push constants,
indirect dispatch and specialization-sized workgroups.

## Remaining native gaps

- `bigint`, `decimal`, `complex` and ranges/operations beyond int64 bounds.
- Runtime source evaluation with `eval`, `exec`, `evxec`, and JIT.
- Nested type/schema/options declarations and advanced format specifications
  beyond plain `.format` fields and `%s`/`%%`.
- Full tracing garbage collection: native reference cycles can retain memory
  until process exit. Reference-value identity is supported; scalar boxing
  identity differs from the managed interpreter.
- Non-Windows targets and a native Vulkan backend.

Declare globals/imports before functions which use them. The compiler still
rejects source-order cases whose lexical binding could depend on a future
variable/import declaration. It does not silently bind those cases differently.

The ordinary runner retains the full language. `build.ps1 -Native -Graphics`
runs interpreter, GPU and standalone native regression tests. Additional
portable GPU/audio/compute checks are in `tooling/verify-native-expanded.py`.

The project entry for Cubes Game TI may be in `cubesgameti/cubesgameti.oak`.
Compile that layout with `--libpath .`; put its `assets/` beside the native EXE.
The portable builder retains the ordinary source layout and supplies the native
font layout as well. Oak Blocks also compiles unchanged; `build.ps1 -Native`
packages `dist/OakBlocks/oakblocks.exe` and `NativePlay.cmd` with its assets.

Optional built-in CUDA 3D rendering is compiled directly into native programs.
Select `use_cuda(true)` before creating windows; the same mesh/model/polygon APIs
are used. Only an NVIDIA CUDA 12.8-capable display driver is needed at runtime;
CUDA compiler packages are not embedded. See [CUDA rendering](CUDA_RENDERING.md).

Class limits: no custom metaclasses, built-in subclasses, `@slots`, automatic
finalizers/weak references, async methods or class-pattern matching. The native
backend still rejects bigint/decimal/complex and dynamic eval/exec/evxec.
