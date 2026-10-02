# OakScript 0.4.0 implementation and verification

This Windows x64 distribution includes the self-contained runner, complete syntax reference, advanced API guide, and runnable OakScript examples. The 0.4.0 release also includes the Windows VS Code extension and portable Oak Blocks / Acorn Run learning examples. Earlier releases retain their original versioned downloads.

## Implemented in 0.4.0

- Three fenced Vulkan frame contexts; cached geometry, transforms, shaders, pipelines, samplers, and descriptors; safe retirement of texture revisions.
- General WAV sound and streaming music, stereo voices, volume/pitch/looping, listener-relative spatial audio, attenuation, and nested audio buses.
- Matrix inverse/determinant, projection, look-at, rotations and affine decomposition; full quaternion rotation, interpolation and conversion operations.
- Multiple independently presented Vulkan windows with per-window camera, lights, shaders, and input state.
- General storage-buffer/image GPU compute, explicit readback, and direct sampling of compute textures on their owning device.
- Directional, spot, and six-face point-light GPU shadow maps, depth bias, and PCF filtering.
- Triple-quoted strings with LF line endings and corresponding editor support.

Matrix multiplication uses column vectors: `A * B * vector` applies B before A. Quaternions retain `x, y, z, w` ordering. The full implemented language and resource APIs are documented in [SYNTAX.txt](SYNTAX.txt) and [docs/ADVANCED_API.txt](docs/ADVANCED_API.txt).

## Verification

The October 2, 2026 build passed **253 runtime/GPU checks with zero failures**, plus **11 checks in the native VS Code extension host**. The self-contained executable is 38,372,417 bytes, file version 0.4.0.0, SHA-256 `9bb15ca877d83ba48757b67f9ec3a85ca9aeb1c2435c7a0a603b15005a9b7d34`.

All six new examples passed source checking and execution from a fresh directory containing spaces and Unicode, while running from another working directory with no available .NET SDK. Math, audio, and headless compute ran in the bytecode, AST, and unoptimized execution modes; the graphics compute, multiple-window, and lighting examples produced native Vulkan captures. The syntax reference covers all **130 registered built-in functions**; the earlier 13 standalone reference examples also passed.

Thirty-frame static rendering reused uploads and pipeline resources: 18 buffer uploads across the three frame contexts, one texture upload, two graphics pipelines, and one cached surface descriptor. A compute-image rendering check used zero texture uploads. Independent-window SDL event checks verified input routing and continued rendering after closing one window. Directional, spot, and all six point-shadow faces were rendered, with localized GPU occlusion verified against shadows disabled; captures were visually inspected.

Audio checks verified the mixer, stream block transitions/loops, stereo, pitch/volume, buses, pause/stop, attenuation/listener orientation, and the native SDL output queue. Portable audio example verification muted its buses. **Audible listening and physical keyboard/mouse, resize/minimize, and native window-close interaction remain unverified.** Automated events and rendered captures do not substitute for these manual checks. Other PCs and GPU vendors have not been tested.

## Current limits

- Windows x64 binaries only; graphical and compute programs require a working Vulkan driver.
- WAV audio only; MP3/OGG, recording, DSP effects, and audio-device selection are not implemented.
- Diffuse lighting rather than PBR. Normal maps, cascaded directional shadows, configurable shadow-map resolution, area lights, and contact shadows remain future work. There are at most 16 lights and 32 shadow-map faces; each point light uses six faces. Oak Blocks keeps its readable example-specific sun/AO/fog shader.
- Compute uses precompiled SPIR-V. Runtime shader compilation, arbitrary custom uniforms, indirect dispatch, and a post-processing graph are not implemented. Compute textures belong to their creating device; explicit snapshots transfer between devices.
- Affine decomposition supports translation/rotation/scale and rejects shear, perspective, or zero scale. User-defined types are nominal records; class inheritance, generics, and operator overloading are not implemented.
- glTF/GLB support is a static documented subset; animations, skinning, morph targets, sparse accessors, and compression extensions are not implemented.
- Bytecode compilation and optimization are implemented; native code generation/JIT and standalone serialized bytecode artifacts are not implemented.
- Local/HTTP registries and exact-version locks are implemented; hosted public publishing, dependency-range solving, and platform-independent distributions remain future work.
- Oak Blocks has a finite, session-only creative world without saves, survival, infinite terrain, audio, or multiplayer. Acorn Run is silent and uses a fixed layout.

The runner and its original implementation use [LICENSE.txt](LICENSE.txt). Dependencies and game fonts keep their independent licenses. The implementation source and build tooling are not part of this distribution repository.
