# Oak Blocks texture pack

Ten original 32 x 32 RGBA PNGs are loaded directly by `lib/textures.oak`.
Replacing a PNG and restarting the game changes that block's rendered image.
No atlas repack, shader change, or EXE rebuild is required.

| File | Block faces |
| --- | --- |
| grass_top.png | Grass top |
| grass_side.png | Grass sides; green cap above earth |
| earth.png | Earth, grass bottom |
| stone.png | Stone |
| oak_bark.png | Oak sides |
| oak_end.png | Oak top and bottom; growth rings |
| leaves.png | Leaves |
| sand.png | Sand |
| brick.png | Brick with staggered mortar lines |
| lantern.png | Lantern with a wooden frame and glowing panel |

Nearest filtering keeps pixel-art edges crisp; GPU mipmaps reduce distant
shimmer. Each voxel face spans the full image with standard 0..1 UVs. PNG row
zero maps to the top of vertical faces. Mesh vertex colors contain ambient
occlusion, so image colors are not multiplied by a second block palette.
Sunlight, fog, and lantern emission still come from the lighting shader.

The hotbar displays these same textures. `texture-demo.oak` (or the portable
`Textures.cmd`) displays all eight block types as actual voxel meshes beside
PNG previews. `contact-sheet.png` is an asset-review image, unused by the game.

This pack is original OakScript artwork, generated offline by the optional
standard-Python authoring tool `tooling/make-block-textures.py`. That tool
recreates the supplied art and overwrites edits; it is not part of the game
startup or build. You can edit the checked-in images directly. Current block
surfaces are opaque; transparent/cutout foliage is not implemented.
