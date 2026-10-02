# OakScript

OakScript (Oak) is a programming language with a portable Windows x64 file runner, an optimizing bytecode VM, typed records, modules, package support, and built-in Vulkan graphics and input handling. The current runner is **0.3.2**.

Read [SYNTAX.txt](SYNTAX.txt) for the complete implemented syntax, every built-in function and resource attribute, and runnable examples.

## Download and run

Download the repository using **Code > Download ZIP**, then extract it. This keeps [oakscript.exe](oakscript.exe), [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md), and [third-party-licenses/](third-party-licenses/) together. A portable runner bundle, **OakScript-0.3.2-win-x64.zip**, is also available from [Releases](https://github.com/FIRECATCHER404/OakScript/releases).

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

Download: [OakBlocks.zip](https://github.com/FIRECATCHER404/OakScript/releases/download/v0.3.2/OakBlocks.zip) from [0.3.2 release](https://github.com/FIRECATCHER404/OakScript/releases/tag/v0.3.2)

Again, this is provided simply to show the capabilities and structure of oakscript code, so you can use it to learn and yea.

Controls: Enter starts/resumes; WASD moves; Space jumps; Shift crouches; F toggles flight, with Space up/Shift down; mouse looks; left click breaks; right click places; 1–8 or the wheel selects a block; Escape pauses; R returns to the clearing; Q quits while paused.

## Distribution contents

This repository distributes the compiled runner and language documentation. The compiler/runtime implementation source and build tooling are not included here. The Oak Blocks release includes the example game's source files for learning.

Please do not redistribute the executable. Keep `assets/OFL.txt` with the included font when redistributing the example. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for dependency notices.
