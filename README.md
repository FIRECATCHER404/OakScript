# OakScript

OakScript (Oak) is a programming language with a portable Windows x64 file runner, an optimizing bytecode VM, typed records, modules, package support, and built-in Vulkan graphics, input, audio, and GPU compute. The current runner is **0.4.0**.

Read [SYNTAX.txt](SYNTAX.txt) for the complete implemented syntax, every built-in function and resource attribute, and runnable examples.

## New in 0.4.0

- Vulkan frame fences and reusable geometry, shaders, pipelines, textures, and descriptors reduce synchronization and repeated uploads.
- General WAV audio: sound loading, playback, looping, volume, pitch, stereo pan, positional sound and attenuation, bounded music streaming, and nested audio buses.
- Matrix inverse, determinant, multiplication helpers, projections, look-at, rotations, and affine decomposition; quaternion multiplication, normalization, inverse, conjugate, vector rotation, interpolation, and Euler/matrix conversion.
- Multiple windows with independent Vulkan presentation resources, cameras, lights, and input state.
- General GPU compute with storage buffers/images, explicit readback, and direct use of compute images as graphics textures on their owning device.
- Directional, point, and spot light objects with real GPU shadow maps, depth bias, and hard/PCF filtering.
- Single- and double-quoted triple strings with LF (`\n`) line endings, plus updated VS Code highlighting and language-server support.

The existing math convention is unchanged: `matrix * vector` uses column vectors, `A * B * vector` applies B before A, and quaternion components are ordered `x, y, z, w`.

See [docs/ADVANCED_API.txt](docs/ADVANCED_API.txt) for signatures and resource attributes, [examples/](examples/) for runnable programs, and [IMPLEMENTATION_STATE.md](IMPLEMENTATION_STATE.md) for verification and current limits.

## Download and run

Download the repository using **Code > Download ZIP**, then extract it. This keeps [oakscript.exe](oakscript.exe), [LICENSE.txt](LICENSE.txt), [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md), and [third-party-licenses/](third-party-licenses/) together. The portable [OakScript-0.4.0-win-x64.zip](https://github.com/FIRECATCHER404/OakScript/releases/download/v0.4.0/OakScript-0.4.0-win-x64.zip) bundle includes the runner, documentation, examples, and example assets. Both are available from [the 0.4.0 release](https://github.com/FIRECATCHER404/OakScript/releases/tag/v0.4.0).

Once downloaded you can run the following with the Executable:

```cmd
oakscript.exe --version
oakscript.exe C:/path/to/file.oak
oakscript.exe "C:/path with spaces/file.oak" first "second argument"
```

The EXE is self-contained: users do not need .NET, Python, or the Vulkan SDK installed. This build targets **Windows x64**. Graphics programs need a working Vulkan GPU driver; console programs do not initialize graphics. macOS/Linux binaries are not included. Portability was tested in separate folders on the development PC; other computers and GPU vendors have not been tested.

Add the folder containing the EXE to your user PATH to invoke `oakscript` from any directory. Otherwise use `.\oakscript.exe` from its folder or the EXE's full path. There is no automatic `.oak` file association.

Here's an example of what a basic OakScript program looks like:

```text
def add(int a, int b) -> int:(
    return a + b
)
print("Hello, Oak!", add(2, 3))
```

To run:

```cmd
oakscript.exe filename.oak
```

## Useful commands

```cmd
oakscript.exe --help
oakscript.exe --check program.oak
oakscript.exe --bytecode program.oak
oakscript.exe --profile program.oak
oakscript.exe --engine ast program.oak
oakscript.exe --frames 4 --capture frame.png game.oak
```

Options precede the source file. Arguments after the source filename become the script's `args` list. Relative imports, asset loading, and file I/O resolve beside the source module, so scripts can run from another working directory. Keep your `.oak` libraries and assets with the program; they are not embedded automatically into this runner.

## Oak Blocks

Oak Blocks is a small Minecraft-style creative sandbox built using ordinary imported Oak libraries and the built-in graphics, keyboard, and mouse APIs. It is provided as a readable example for people learning OakScript. The ZIP includes the runner, all `.oak` game/library sources, ten block PNG textures, font and font license, GLSL shader sources, compiled SPIR-V shaders, tests, and a game README.

Download: [OakBlocks.zip](https://github.com/FIRECATCHER404/OakScript/releases/download/v0.4.0/OakBlocks.zip) from [0.4.0 release](https://github.com/FIRECATCHER404/OakScript/releases/tag/v0.4.0). Extract the complete ZIP and open `Play.cmd`; open `Textures.cmd` for the texture gallery. This package includes the 0.4.0 runner. Its readable game-specific shaders retain their sun, ambient-occlusion, and fog implementation; the separate `examples/graphics-lighting.oak` program demonstrates the new runtime shadow maps.

Again, this is provided simply to show the capabilities and structure of oakscript code, so you can use it to learn and yea.

Controls: Enter starts/resumes; WASD moves; Space jumps; Shift crouches; F toggles flight, with Space up/Shift down; mouse looks; left click breaks; right click places; 1–8 or the wheel selects a block; Escape pauses; R returns to the clearing; Q quits while paused.

The release also includes [AcornRun.zip](https://github.com/FIRECATCHER404/OakScript/releases/download/v0.4.0/AcornRun.zip), a small OakScript platformer with its source libraries and assets. Extract it and open `Play.cmd`.

## VS Code extension

Download [oakscript-0.4.0.vsix](https://github.com/FIRECATCHER404/OakScript/releases/download/v0.4.0/oakscript-0.4.0.vsix), then use **Extensions > ... > Install from VSIX** in VS Code, or run:

```cmd
code --install-extension oakscript-0.4.0.vsix
```

The Windows x64 extension includes the current runner, syntax highlighting, diagnostics, completion, hover, definitions, symbols, and **OakScript: Run File / Check File** commands. It requires VS Code 1.85 or newer.

## Distribution contents

This repository distributes the compiled runner, language documentation, and small OakScript examples. The compiler/runtime implementation source and build tooling are not included here. The game release ZIPs include the example games' source files for learning. [SHA256SUMS.txt](SHA256SUMS.txt) contains checksums for the runner and current release downloads.

Earlier runner and VSIX releases remain available in [Releases](https://github.com/FIRECATCHER404/OakScript/releases).

## License and redistribution

The OakScript executable and its original compiler/runtime implementation source are covered by the [OakScript Limited Use License — No Redistribution](LICENSE.txt). You may download and run the software on devices you control, including to run your own programs and learn from Oak Blocks. **Redistributing, re-uploading, mirroring, selling, or bundling the executable or its implementation source, including modified versions, requires the owner's prior written permission**, subject to the third-party, statutory, platform, and earlier-license rights described in the license.

You can share links to the official downloads. Your independently authored `.oak` programs and their outputs are not restricted just because they use OakScript; have recipients download the runner here instead of bundling it with your program.

Third-party components keep their own licenses and permissions. The public repository also remains subject to GitHub's viewing/fork rights. See [LICENSE.txt](LICENSE.txt), [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md), and [third-party-licenses/](third-party-licenses/). The games' fonts retain their separate licenses in each game package's `assets/OFL.txt`.
