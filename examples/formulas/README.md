# Oak Formula Programs

Two programs written entirely in OakScript, using a shared arithmetic library and the built-in Vulkan graphics/input APIs. They run with the included **OakScript 0.5.0 Windows x64 runner**; no Python, SDK, external model, or custom shader files are needed.

## 1. Formula Pixels

From the OakScript project folder:

```powershell
./dist/oakscript.exe examples/formulas/pixels.oak "x&y" "(800,600)"
./dist/oakscript.exe examples/formulas/pixels.oak "x^y" "(800,600)"
./dist/oakscript.exe examples/formulas/pixels.oak "x|y" "(800,600)"
./dist/oakscript.exe examples/formulas/pixels.oak "x**y" "(800,600)"
./dist/oakscript.exe examples/formulas/pixels.oak "(x*65536 + y*256)" "[800,600]"
./dist/oakscript.exe examples/formulas/pixels.oak "(sin(x/30)+cos(y/25))*4000000" "(800,600)"
```

The first argument is the quoted formula. The second is a quoted `(width,height)` tuple or `[width,height]` list. `x` runs from zero through width minus one, and `y` from zero through height minus one. The pixel origin is the top-left corner.

The program uses nested loops to evaluate every pixel once. It truncates fractional results toward zero, wraps the integer into the 24-bit RGB range with modulo **16,777,216**, and uses the six-digit `RRGGBB` value as the pixel color. For example, decimal `72370` becomes `011ab2`, or RGB `(1,26,178)`. A value of `16777216` wraps to `000000`; `-1` wraps to `ffffff`.

Integer literals and expressions using `+`, `-`, `*`, `^`, `&`, `|`, and nonnegative integer powers retain their exact low RGB bits, even when their full value is enormous. In particular, `x**y` works across an 800×600 image without floating-point overflow or losing color bits. A recurrence speeds up that specific power formula; direct `x&y`, `x^y`, and `x|y` also have fast paths. General integer-power expressions use modular exponentiation. The exponent must be numerically evaluable and at most `2**53-1`.

Rows are generated over several frames so the window can process input. The progress bar disappears when the image is complete. All pixel data is uploaded once, then displayed as one cached texture. Resizing stretches the original image; it does not change the formula's coordinate bounds. Windows can enforce a minimum native window size for very small requested dimensions, which also stretches the image. **Escape** closes or cancels.

## 2. Formula Voxels

```powershell
./dist/oakscript.exe examples/formulas/voxels.oak "100-(x-12)**2-(y-12)**2-(z-12)**2" "(800,600)" "(24,24,24)" 0
./dist/oakscript.exe examples/formulas/voxels.oak "(x^y)&z" "(800,600)" "(24,24,24)" 8
./dist/oakscript.exe examples/formulas/voxels.oak "(x&y&z)==1" "(800,600)" "(50,50,50)" 0
./dist/oakscript.exe examples/formulas/voxels.oak "sin(x/3)+cos(y/3)+sin(z/3)" "[1000,700]" "[32,32,32]" 1.5
./dist/oakscript.exe examples/formulas/voxels.oak "x+y+z" "(800,600)" "(16,24,12)" 25
```

Arguments:

1. Quoted formula with `x`, `y`, and `z`.
2. Quoted screen `(width,height)` or list.
3. Quoted simulation `(width,length,height)` or list: **X width, Z length, Y height**.
4. Optional numeric threshold, default **0**.

The program evaluates every integer coordinate in the bounds using three nested loops. It adds a cube only when **formula result > threshold**; equality does not create a cube. Coordinates start at zero, so `(16,24,12)` samples `x=0..15`, `z=0..23`, and `y=0..11`.

Comparisons return numeric **1** for true and **0** for false. To show cells where the bitwise AND equals one, use `"(x&y&z)==1"` with threshold `0`. To show the other cells, use `"1-((x&y&z)==1)"` with threshold `0` and smaller bounds if needed to stay below the occupied-cube limit. `"0-(x&y&z == 1)"` returns only `0` or `-1`, so it selects **no cells** at threshold `0`.

Each cube is 0.16 world units wide, with centers 0.16 units apart, so adjacent occupied cells touch with no gaps. The volume is centered around the origin for viewing. The formula controls occupancy. All cubes use the same neutral gray and the runtime's directional/ambient lighting to make their faces visible. Red/green/blue axes mark X/Y/Z. Only exposed faces are built: faces between occupied neighbors are omitted, including neighbors in different mesh batches. Cubes are processed in batches of at most 512 cells and cached each frame; a fully enclosed batch needs no mesh. No model file or per-frame geometry generation is required.

| Control | Action |
| --- | --- |
| W / S | Fly forward / backward in the viewing direction |
| A / D | Strafe left / right |
| Space / Shift | Move up / down |
| Hold right mouse and move | Look around |
| Arrow keys | Look around without capturing the mouse |
| Mouse wheel | Change movement speed |
| R | Reset the camera to frame the volume |
| Escape | Close / cancel |

Generation and mesh building show progress; the camera works during both. Focus loss releases mouse capture. A threshold that selects no points shows the axes and prints a clear message.

## Formula syntax

Supported operators: `+ - * / % ** ^ & | == != < <= > >=`, parentheses, and unary `+/-`. `**` is exponentiation and associates to the right: `2**3**2` is `512`. `-2**2` is `-4`; `(-2)**2` is `4`. `^` is integer bitwise XOR, `&` is integer bitwise AND, and `|` is integer bitwise OR. Bitwise operators associate to the left, like Python; `2^3^2` is `3`. Multiplication must be explicit: `2*x`, not `2x`.

Precedence follows Python, from lowest to highest: comparisons, `|`, `^`, `&`, `+ -`, `* / %`, unary `+/-`, `**`. The right-hand side of `**` accepts unary signs, so `2**-2` is `0.25`. Examples: `1|2^3&1` is `3`, `2+3&6` is `4`, and `2**3^2` is `10`.

Comparisons accept integer or floating-point operands and yield integer `0` or `1`, usable in arithmetic and bitwise expressions. `x&y&z == 1` means `(x&y&z) == 1`. Use parentheses when multiplying a mask, such as `(x<y)*16777215` for white pixels where `x<y`. Chained comparisons such as `0<x<y<z` require every comparison to hold, evaluate each operand once, and stop at the first false comparison. Comparison operands use ordinary numeric evaluation, with its floating-point precision and range limits; they are compared before RGB wrapping. Invalid operands make the sample undefined unless a preceding false comparison has already stopped the chain.

Bitwise operands must be integers. Decimal/scientific literals, division, and floating-point math remain floating-point values even when their result happens to be whole: `x&1.0` and `(x/2)|y` are rejected. Use `floor`, `ceil`, or `round` to convert, such as `floor(x/2)^y`. Signed bitwise operations use Python's sign-extension behavior: `-1&255` is `255`, and `-2^5` is `-5`. The numeric evaluator used by 3D and mixed floating-point formulas supports exact bitwise operands in `[-2**53, 2**53-1]`; values outside that range or dynamically noninteger operands produce undefined samples. The exact integer-color subset described above can use arbitrarily large integer literals and powers because only the low 24 RGB bits are needed.

Supported constants: `pi`, `e`, ordinary decimal numbers, and scientific notation such as `1.5e3`. Names are case-sensitive. The 2D program rejects `z`.

Functions:

```text
sin(value), cos(value), tan(value)          angles in radians
sqrt(value), abs(value)
floor(value), ceil(value), round(value)     round uses ties-to-even
log(value), ln(value), log10(value), exp(value)
pow(base,exponent), min(a,b), max(a,b), clamp(value,low,high)
```

This is an arithmetic parser, not Oak source evaluation. Assignments, imports, arbitrary function calls, and commands are rejected. Malformed formulas report the offending character position.

Ordinary numeric evaluation uses floating-point arithmetic within `+/-1e300`. Expressions outside the exact integer-color subset use that numeric evaluator. Undefined/out-of-range samples (such as division by zero or square root of a negative value) are counted and rendered black in 2D or omitted in 3D, with the count printed. Underflow becomes zero. Extremely large intermediate exponents cannot be recovered by later operations; simplify or rescale those formulas. Formulas are limited to 512 characters and a tree depth of 48; nesting may reach that limit sooner because parentheses and function arguments use parser depth too.

Each screen dimension must be a positive integer at most 16,384, and the screen may contain at most 16,777,216 pixels. A 3D volume may contain at most **1,000,000 samples** and **65,536 occupied cubes**. Exceeding a limit produces an explicit error; results are never silently truncated. Larger images and plots require more CPU/GPU memory.

## Portable bundle

`dist/FormulaPrograms.zip` contains the runner, both programs, shared libraries, these instructions, tests, and license notices. Extract the whole ZIP and keep its files together. **Pixels.cmd** and **Voxels.cmd** run their respective demos when double-clicked; arguments replace the demo:

```cmd
Pixels.cmd "x&y" "(800,600)"
Voxels.cmd "100-(x-12)**2-(y-12)**2-(z-12)**2" "(800,600)" "(24,24,24)" 0
```

From its extracted folder you can also run `oakscript.exe pixels.oak ...` or `oakscript.exe voxels.oak ...`. To use runner options, put them before the program filename:

```powershell
./oakscript.exe --frames 80 --capture pixels.png pixels.oak "x&y" "(800,600)"
./oakscript.exe --frames 40 --capture sphere.png voxels.oak "100-(x-12)**2-(y-12)**2-(z-12)**2" "(800,600)" "(24,24,24)" 0
./oakscript.exe test.oak
```

Use enough frames for generation to finish before capturing. Progress is also printed to the console. Keep dimensions quoted in PowerShell and CMD so tuples/lists are passed as one argument.

## Verification and license

The latest runner accelerates general function calls and record defaults, including the recursive formula evaluator. Voxel meshing caches face corners, omits hidden faces, and processes as many mesh batches as fit within an 8 ms frame budget. `oakscript benchmark.oak` runs console-only calculations with result assertions; `python tooling/benchmark-performance.py` compares preserved and current runners, including actual GPU generation. Measured results and remaining execution-engine work are documented in [PERFORMANCE.md](PERFORMANCE.md).

The shared libraries pass 143 checks in the bytecode, AST, and unoptimized engines, including Python operator precedence, all six comparisons, numeric masks, short-circuit comparison chains, signed bitwise values, integer conversion, fractional powers, function domains, RGB padding/wrapping, enormous integer powers, argument tuples/lists, strict threshold boundaries, camera movement/diagonal speed, and volume framing in tall/wide viewports. Each native 800×600 capture of `x&y`, `x^y`, `x|y`, and `x**y` is compared pixel-for-pixel against independent Python references. Mixed bitwise RGB formulas, comparison masks/chains, negative operands, float-to-integer conversion, undefined samples, and 3D bitwise occupancy have separate rendering checks. Native 50×50×50 plots test both `0-(x&y&z == 1)` and `(x&y&z)==1` against independent cube counts. A native 24×24×24 sphere plot produces 4,139 cubes in nine batched meshes.

Automated rendering does not prove physical keyboard/mouse, resizing, or native window-close interactions. Those manual checks remain unverified. Windows x64 and a working Vulkan GPU driver are required; other machines and GPU vendors have not been tested.

The included runner uses the OakScript Limited Use License — No Redistribution in `LICENSE.txt`. Dependency notices are in `THIRD-PARTY-NOTICES.md` and `third-party-licenses/`. Independently authored Oak programs are not restricted merely because they run on OakScript.
