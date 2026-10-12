# Third-party notices

OakScript uses these pinned packages and their transitive dependencies. Their copyright and license notices are distributed in `third-party-licenses/` beside this file.

`LICENSE.txt` applies to the owner's original OakScript implementation and executable only to the extent of rights the owner controls. It does not replace or narrow the independent licenses and permissions of the third-party components listed below or the included font. Redistribution rights granted by those licenses remain in force for those components.

- Veldrid 4.9.0, Veldrid.StartupUtilities 4.9.0, Veldrid.SDL2 4.9.0: Eric Mellino and Veldrid contributors, MIT. https://github.com/veldrid/veldrid
- Veldrid.SPIRV 1.0.15: Eric Mellino and contributors, MIT. Its native shader translation library includes SPIRV-Cross (Apache 2.0), shaderc and SPIRV-Tools (Apache 2.0), SPIRV-Headers (MIT), glslang (BSD/MIT and related notices), re2 (BSD) and effcee (Apache 2.0). Upstream tag `v1.0.15`, submodule and `ext/known_good.json` revisions supply the complete `Veldrid-SPIRV-*` notices in `third-party-licenses/`. https://github.com/veldrid/veldrid-spirv/tree/v1.0.15
- Vk 1.0.25: Eric Mellino and contributors, MIT. https://github.com/mellinoe/vk
- NativeLibraryLoader 1.0.13: Eric Mellino and contributors, MIT. https://github.com/mellinoe/nativelibraryloader
- StbImageSharp 2.30.16: StbSharp contributors, distributed under the Unlicense alternative. https://github.com/StbSharp/StbImageSharp
- StbTrueTypeSharp 1.26.12: StbSharp contributors; public-domain C# port of stb_truetype. https://github.com/StbSharp/StbTrueTypeSharp
- SDL2 native runtime: Sam Lantinga and SDL contributors, zlib license. https://www.libsdl.org/license.php
- Vortice Windows bindings: Amer Koleci and contributors, MIT. https://github.com/amerkoleci/Vortice.Windows
- SharpGen runtime: Alexandre Mutel, Jeremy Koritzinsky and contributors, MIT. https://github.com/SharpGenTools/SharpGenTools
- Newtonsoft.Json: James Newton-King and contributors, MIT. https://github.com/JamesNK/Newtonsoft.Json
- The self-contained Microsoft .NET runtime: .NET Foundation and contributors, MIT and associated third-party notices. https://github.com/dotnet/runtime

The optional native compiler invokes an installed MinGW-w64 GCC toolchain; the
toolchain itself is not bundled. The included native examples and the runner's
embedded optional `oakcuda.dll` driver bridge were built with GCC 15.2.0 and
statically link these native runtime components:

- GCC `libgcc` and GNU `libstdc++`: Free Software Foundation and contributors,
  GPL-3.0-or-later with GCC Runtime Library Exception 3.1. The license, exception,
  and installed package's license summary are in `third-party-licenses/GCC-runtime-*`.
  [Official runtime license](https://gcc.gnu.org/onlinedocs/libstdc++/manual/license.html).
- MinGW-w64 runtime: MinGW-w64 contributors; Zope Public License 2.1, public-domain
  and other notices reproduced in `third-party-licenses/MinGW-w64-*`.
- MinGW-w64 winpthreads: MinGW-w64 contributors; its MIT/BSD notices are reproduced
  unchanged in `third-party-licenses/winpthreads-COPYING.txt`.

Native programs built using another toolchain use that toolchain's own runtime
components and notices. The runner's CUDA bridge includes these GCC libraries;
the managed interpreter itself does not link them.

The CUDA kernels and driver bridge are original OakScript code. The runner and
native EXEs embed their generated PTX, but no NVIDIA Toolkit/NVRTC/compiler DLLs
are redistributed. `nvcuda.dll` is loaded from the user's installed NVIDIA
display driver. The optional build helper downloads checksum-verified NVIDIA
NVRTC 12.8.93 into a local build cache only; that tool remains subject to its
own NVIDIA license. https://docs.nvidia.com/cuda/nvrtc/index.html

The example models, checker texture, Acorn Run scenery, Oak Blocks textures, and example WAV sounds are generated within this project. Acorn Run and Oak Blocks include the unchanged Atkinson Hyperlegible font, copyright 2020 Braille Institute of America, Inc., under SIL Open Font License 1.1. Its full license is distributed with each game's font as `assets/OFL.txt`.

Native graphics also compiles stb_truetype, stb_image and stb_image_write from nothings/stb,
pinned at 2c980bb59875b0d32144a71867fbdebb2f77cd20. These native headers retain
their MIT/Public Domain alternatives; complete license text is in
`third-party-licenses/stb-native-LICENSE.txt`. Source: https://github.com/nothings/stb

Native SPIR-V shader translation uses SPIRV-Cross (Khronos Group and contributors),
pinned at aa217aeb6c9f0ace7a0ab233b28807edf45eb165, under Apache License 2.0.
The full license and copyright notices are in
`third-party-licenses/SPIRV-Cross-Apache-2.0.txt` and the vendored source headers.
Source: https://github.com/KhronosGroup/SPIRV-Cross
This translates GPU shader binaries; it does not execute Oak programs.

Native glTF/GLB model loading uses nlohmann/json (Niels Lohmann and contributors),
pinned at 23d3b373e1a41db5adde1081b409e66de1d65030, under the MIT License.
The full license is in `third-party-licenses/nlohmann-json-MIT.txt`.
Source: https://github.com/nlohmann/json
