# Oak execution performance

The 2026-10-03 performance rebuild improved the language runtime and the Formula Voxels program. Both measured executables report OakScript 0.4.0; the runner used for these measurements has SHA-256 `cf2f304e362e63d5d1cd9e96d2b3db2d9d3dd2611642cad5493f3dfe79eafa7f`. Later language-feature rebuilds retain these optimizations and have different executable hashes; the table records the original measurements rather than a fresh benchmark of every subsequent build.

## Measured results

These are medians of three runs on this Windows machine. They measure the work inside each program, rather than EXE extraction or the extra frames rendered after generation completes. Results depend on the workload and hardware.

| Workload | Previous runner | Rebuilt runner | Speedup |
| --- | ---: | ---: | ---: |
| 100,000 typed function calls | 407.335 ms | 64.459 ms | 6.32x |
| 500,000 integer arithmetic iterations | 225.694 ms | 205.429 ms | 1.10x |
| 20,000 records with default fields | 181.593 ms | 30.249 ms | 6.00x |
| Sphere formula, 13,824 samples | 3,545.856 ms | 972.580 ms | 3.65x |
| Bitwise formula, 960 samples | 132.252 ms | 58.778 ms | 2.25x |
| Complete 24x24x24 sphere generation | 4,692 ms | 1,652 ms | 2.84x |
| Complete solid 32x32x32 generation | 6,224 ms | 1,177 ms | 5.29x |

The calculation benchmark and shared formula library are byte-identical between the preserved and rebuilt runs. The same formula produces exactly 4,139 sphere cubes or 32,768 solid cubes before and after. The complete generation measurements include window/camera/axes setup, sampling, and mesh construction. Rendering still uses the same built-in Vulkan API, lighting, gray cube colors, and touching cell dimensions.

## Runtime changes

- Bytecode returns use normal control flow, avoiding an exception per function call or record-default evaluation. AST mode retains its reference implementation.
- Each interpreter reuses its own VM call frames. Recursive/nested calls rent separate frames, and releasing a frame clears its values, lexical-scope stack, and iterators.
- Scalar coercion checks common types directly; nominal record/option type descriptors and built-in argument schemas are cached. Vector and matrix assignments still copy values.
- Simple variable assignments use a direct store opcode. Checked integer overflow, evaluation order, type checks, read-only bindings, and error locations are preserved.
- Optimized `for` loops reuse dictionaries only when no nested function or record declaration can capture their scope. Such declarations retain fresh scopes on every iteration.
- The runner requests fully optimized .NET host code without tier-promotion warmup. This is configuration of the interpreter's host, rather than Oak native-code generation. See Microsoft's [compilation settings](https://learn.microsoft.com/en-us/dotnet/core/runtime-config/compilation) for the host setting and its startup/throughput tradeoff.

Voxel meshing precomputes face corners, omits faces between occupied neighbors across mesh-batch boundaries, and skips entirely enclosed batches. Generation processes multiple batches within an 8 ms CPU budget per frame rather than waiting one frame per batch. Exposed faces retain their flat normals; the visible volume has no artificial gaps.

## Reproduce and verify

From the portable Formula Programs folder:

```cmd
oakscript benchmark.oak
oakscript test.oak
oakscript --engine ast test.oak
oakscript --no-opt test.oak
```

From the development workspace, `python tooling/benchmark-performance.py` runs both preserved and rebuilt versions. `--after-only` reuses the existing baseline after verifying its runner hash and benchmark source. The report in `artifacts/performance-verification.json` records every timing sample, executable hashes, and relevant Oak source hashes. Baseline files are kept in `artifacts/performance-before/`. Python is only a development verification tool; the Oak programs require neither Python nor an SDK.

`build.ps1 -Graphics` passed 261 runtime/GPU checks, including new regression checks for early returns, nested calls, captured loop variables, record-default closures, runtime return types, surface-face counts across batches, and completely enclosed cells. The formula suite also checks its 81 assertions in optimized bytecode, unoptimized bytecode, and AST modes. Native captures cover both the sphere and solid volume, and the portable formula verifier compares all pixels against independent references.

## Remaining work

Oak still interprets bytecode. Oak native code generation/JIT, register allocation, inlining, unboxed numeric locals, and broader expression specialization remain unimplemented. Heavy recursive formulas and very large grids can still take time; these measured speedups do not promise native-language performance. The existing volume and occupied-cell limits still apply. Physical camera/input interactions remain unverified by these automated measurements.
