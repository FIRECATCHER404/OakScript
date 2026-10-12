# Oak Blocks

A small Minecraft-style creative sandbox written in OakScript libraries. Walk around a grove, jump onto blocks, crouch at ledges, fly, and build with eight block types. The world has grass, earth, stone, oak, leaves, sand, brick, and bright lantern blocks. No model files are used.

Extract the complete **OakBlocks.zip** release, then double-click **Play.cmd**. From the extracted folder, you can also run:

```powershell
.\oakscript.exe main.oak
```

Requires OakScript **0.3.2** or newer and a Vulkan-capable graphics driver. The portable folder/ZIP includes the Windows x64 runner, libraries, font, licenses, and compiled shaders; no SDK, network connection, or package installation is needed. Keep its files together. Initial world generation takes a few seconds.

The launcher also accepts runner options, for example `Play.cmd --frames 4 --capture preview.png`.

This game is an example for learning OakScript. The portable package includes `SYNTAX.txt`, the complete syntax and built-in reference. Start with `main.oak`, then read `lib/game.oak`, `lib/input.oak`, `lib/physics.oak`, `lib/world.oak`, `lib/raycast.oak`, `lib/textures.oak`, `lib/meshing.oak`, and `lib/render.oak`. Both the Oak game/library sources and GLSL shader sources are included, so you can inspect how input, collision, block placement, textures, and rendering fit together.

| Input | Action |
| --- | --- |
| Enter | Start / resume |
| Mouse | Look around |
| WASD | Walk / fly horizontally |
| Space | Jump; ascend while flying |
| Left Shift / Right Shift | Crouch; descend while flying |
| F | Toggle flight |
| Left mouse | Break the highlighted block |
| Right mouse | Place the selected block against the highlighted face |
| 1–8 / mouse wheel | Select a block |
| R | Return to the clearing, keeping your current builds |
| Escape | Pause / resume and release / capture the mouse |
| Q | Quit from the title or pause screen |

Walking and flight both collide with blocks. Crouching lowers the camera and collision height, slows movement, prevents walking off ledges, and waits for headroom before standing. Diagonal movement is normalized. Jumping uses fixed physics steps with a short input buffer and coyote time. The crosshair picks the nearest block within six blocks; placement cannot overwrite blocks or intersect the player. Hold either mouse button to edit repeatedly at a controlled rate. The bottom foundation is protected. Switching away from the window pauses play and releases the mouse; Enter resumes after returning.

Each block now has a dedicated original **32 x 32 PNG texture**. Grass uses separate top/side images and earth underneath; oak uses bark on the sides and growth rings on its ends. Stone, earth, leaves, sand, brick, and framed lanterns have distinct images. `lib/textures.oak` loads the ten files directly from `assets/blocks/`, and each mesh material binds its own texture. Face UVs span the full PNG; nearest filtering and GPU mipmaps preserve pixel art at close range and reduce distant shimmer. Hotbar icons display the same images.

Double-click **Textures.cmd** in the portable folder to see all eight block types as actual 3D voxel meshes beside PNG previews, or run `oakscript texture-demo.oak`. Replace a PNG in `assets/blocks/` and restart to change that material; no EXE/shader rebuild or atlas repack is needed. See `assets/blocks/README.md` for face mappings. The optional authoring tool `tooling/make-block-textures.py` recreates the original pack; running it overwrites texture edits.

The GLSL block shader samples the images and adds directional sunlight, cool ambient lighting, soft vertex ambient occlusion, distance fog, and emissive lantern surfaces. A second shader draws the sky gradient, sun, and cloud wisps. Shaders are shipped as SPIR-V alongside readable GLSL source. Lanterns do not cast local light, and no shadow maps or general PBR renderer are implemented. Current block images are opaque.

Everything specific to the game lives in `lib/*.oak`: voxel storage/generation, physics, input mapping, ray picking, block edits, visible-face meshing, chunk invalidation, menus, and the hotbar. The runtime additions are general mouse/button/capture/window queries and shader reset. Static meshes reuse native GPU uploads; only edited chunks and AO neighbors rebuild.

Run the headless gameplay checks with:

```powershell
oakscript test.oak
```

This is a bounded **32 × 24 × 32** world with unlimited block inventory. Builds last for the current session; there is no save/load, infinite terrain, survival, audio, or multiplayer. The window starts at 1280 × 800. Physical keyboard/mouse interaction validation is tracked in the root `IMPLEMENTATION_STATE.md`; automated tests cover the actual SDL event pipeline and GPU captures.

The unchanged Atkinson Hyperlegible font is copyright 2020 Braille Institute of America, Inc., under the SIL Open Font License 1.1; see `assets/OFL.txt`. All game geometry is procedural. The block PNGs are original OakScript artwork generated offline and loaded as image assets at runtime; the sky seed is a generated white pixel.

The bundled OakScript executable and its original compiler/runtime implementation source use the **OakScript Limited Use License — No Redistribution**; see `LICENSE.txt`. You may run the game and study/adapt its examples locally. Redistributing, mirroring or bundling the runner or its implementation source, including modified versions, requires the owner's prior written permission, subject to the independent rights in the license. Share the official download link when others need the runner. The font and other third-party components retain their separate licenses; independently authored `.oak` programs are not restricted merely because they use OakScript.

The native compiler can also build this unchanged game:

```powershell
oakscript compile examples/games/oak-blocks/main.oak -o dist/OakBlocks/oakblocks.exe
./dist/OakBlocks/NativePlay.cmd
```

The native executable uses hardware OpenGL 4.3 and needs the existing `assets/`
folder beside it. It needs no OakScript, .NET, compiler or Oak source at runtime.
`build.ps1 -Native` builds it and includes `NativePlay.cmd` in the Oak Blocks ZIP.

The native compiler preserves the block shader's derivative-based face normals,
so sunlight, ambient lighting and lantern shading match the ordinary runner.
