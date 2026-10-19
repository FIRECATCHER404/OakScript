# Support boundary

This is an executable preview, not a universal OakScript/PC backend. Unsupported language constructs and APIs produce target diagnostics. Supported graphics and input paths have been exercised under QEMU/OVMF; that does not establish physical motherboard compatibility.

| Area | Implemented | Missing or limited |
| --- | --- | --- |
| Execution | Optimized native x86-64 code, no VM/interpreter or OS imports | ARM, RISC-V, 32-bit x86, GPU kernels |
| Boot | x64 UEFI application, FAT32/MBR ESP image, optional `ExitBootServices` | Legacy BIOS/CSM, Secure Boot signature |
| Motherboards | Standard UEFI protocol backend; QEMU Q35 and PC tested | Physical ASUS/other board certification, board-specific fixes |
| Display | GOP RGB/BGR framebuffer, preferred EDID mode or largest firmware mode, exact resolution override | Modes firmware does not expose, PixelBitMask/BLT-only GOP, hotplug, multiple monitors |
| Drawing | `clear`, `set_pixel`, `fill_rect`, concave `fill_poly`, nearest-neighbor `texture_blit`, alpha blending, baked-font `draw_text` | GPU acceleration, rotation/tint/regions, 3D, shaders/compute |
| Images | PNG/JPEG/BMP and other StbImageSharp formats decoded at compile time | Animated textures, texture samplers/filters, runtime-created images |
| Keyboard | Existing `key_down`, `key_pressed`, `key_released` names; PS/2 set-1 make/break, simultaneous keys | Native USB HID/xHCI driver; firmware input only produces 90 ms pulses |
| Mouse | Relative PS/2 pointer/buttons, firmware Simple Pointer, mouse_position and mouse_pressed | Native USB HID driver, scrolling and extra buttons |
| Fonts | Literal load_font, embedded sfnt font and baked Latin-1 glyphs, scaled draw_text | General Unicode and advanced text layout |
| Sound | `beep(frequency, seconds)` through PIT/PC speaker | WAV/MP3/music, volume/mixing, HDA/HDMI/Bluetooth/USB output |
| Assets | Literal asset discovery, explicit include set for dynamic paths, embedded read-only virtual files, hashes | Runtime disk writes, generated/external files, network/filesystem discovery |
| Language | Scalars, tuples/vectors, mutable nested lists, bytearrays, selective/aliased imports, functions/defaults, basic types/methods, loops, conditionals | Full runner/native-compiler parity; details below |

## Language

Supported scalar types: signed 64-bit `int`, IEEE double `float`, `bool`, UTF-8 `string`, numeric vectors/colors and `texture`. Integer arithmetic is checked. Division/modulo use floor semantics. Boolean expressions short-circuit; comparison chains evaluate each reached operand once. `sin`/`cos` use a compact polynomial approximation rather than the host math library.

Vectors support numeric component access and assignment; numeric tuples retain exact integers when indexed. Empty and nested lists support creation, append, length, integer indexing/assignment, iteration, membership and returns. Lists/tuples can contain strings and other collections. Bytearrays support zero-filled creation, copying, integer indexing/assignment and full-slice replacement of the same length. General slicing, sequence methods and storing objects/resources inside dynamic collections are not implemented. Explicitly typed values are checked when unboxed from a collection. Strings support concatenation, scalar string(...) and %s, %d, %% formatting.

Functions accept positional arguments, defaults and optional type annotations. Untyped parameters specialize to their static call types. Return types are inferred; recursion requires an explicit -> type. Every path through a value-returning function must return a value. Global variables used by a function must have been declared before its first compiled call. Closures, nested functions, generators, decorators, keyword/rest arguments and function values are not supported.

Basic type declarations support typed fields, default expressions, @init(self,...), methods and stable object references. Objects allocate in the persistent arena. Inheritance, schemas, operator hooks, readonly-field writes and dynamic attributes are not supported. Relative imports support import *, selected names separated by semicolons, per-name aliases and import * as module. Modules have separate symbol identities; aliases reference live bindings and dependencies initialize once. Missing exports, conflicting imports and cycles produce diagnostics. Named package registries and first-class module values are not supported.

Automatic draw() and zero-argument __main__() are supported. A nonzero integer result from __main__ fails the program. Manual loops can call use_render(true) and render_screen(). Timing uses the boot processor TSC calibrated against UEFI Stall; delta_time, time() and sleep(seconds) are available. It uses one CPU core and disables interrupts after leaving firmware services. There is no scheduler or general exception/interrupt handler. args contains strings embedded with repeatable --arg VALUE options.

Other builtins include assert, exit, len, numeric int/float/bool, min, max, clamp, abs, floor, ceil, sqrt, sin, cos, vector/color constructors, window_open, window_size, window_focused, close_window and display dimensions. The fullscreen application always reports focus. print/println produce serial diagnostics; draw_text draws in-frame text. String len measures UTF-8 bytes. Disk/network/process calls and unsupported builtins fail compilation; there is no Windows-runner fallback.

## Hardware requirements

An x64 UEFI system with an RGB/BGR GOP display and enough RAM for the program, 96 MiB of runtime memory, embedded resources and the framebuffer canvas is required. Native monitor resolution is available only when firmware advertises it. Firmware code still initializes the GPU; no installed OS display driver is required. No vendor GPU instruction set or accelerated API is used.

The raw keyboard backend requires translated PS/2 set-1 scancodes at ports 0x60/0x64. Whether USB devices are translated this way depends on firmware and is not guaranteed. Use --bare-metal --keyboard ps2 together so firmware cannot consume the input stream. Letters/digits, Number0-Number9 aliases, arrows, space/enter/escape, shift/control/alt aliases, navigation, ordinary keypad keys and F1-F12 are mapped. International/media layouts remain incomplete. The raw mouse backend handles relative standard three-byte PS/2 packets and three buttons. The firmware mouse backend requires UEFI Simple Pointer support; neither backend is a native USB HID driver.

PC-speaker tones require a physical motherboard speaker/buzzer connected to a compatible PIT/speaker interface. Monitor/HDMI/headphone/laptop speakers are not supported by this backend. `beep` blocks for its duration. Do not interpret a silent motherboard as tested audio support.

The ELF/PE/boot formats and device instruction sets are distinct. The output is PE32+ EFI because that is the firmware-recognized boot format; renaming arbitrary flat bytes `.bin` does not make them bootable. There is no universal executable understood by all CPUs and GPUs.

## Memory and performance

Assets are read-only and immutable. Images are decoded ahead of time to avoid a runtime image library; the original file bytes and decoded pixels are both embedded. Each file is limited to 64 MiB, the raw asset set to 128 MiB and decoded texture data to 128 MiB. The default 64 MiB image imposes a smaller practical output size; a larger EFI can still be copied as a file to a larger FAT32 partition. Dimensions are capped at 16384, with a 256 MiB framebuffer-canvas limit.

Runtime allocation uses checked 48 MiB persistent and 16 MiB scratch arenas, plus a separate 32 MiB managed heap for lists, bytearrays and generated strings. Between automatic draw callbacks, a mark/sweep collector retains module globals and fields of reachable records, reclaims temporary collections and coalesces free blocks. A moving allocation cursor avoids rescanning all earlier objects for each allocation. Manual render_screen() does not collect because local values can remain live across that call; managed allocations in an unbounded manual loop can exhaust the heap. Records themselves remain in the persistent arena and are not reclaimed. Capacity errors stop with serial diagnostics.

The framebuffer copy uses non-temporal x64 stores on BGR modes. Drawing runs on the CPU. Default presentation is capped at 60 frames/s using a timer wait; `--fps 0` uncaps it. Full-frame clears/copies scale with pixel count and memory bandwidth. The recorded benchmark is QEMU TCG emulation, not a physical-machine or vendor-GPU performance claim.

## Specification references

- [UEFI console, keyboard and GOP protocols](https://uefi.org/specs/UEFI/2.10/12_Protocols_Console_Support.html)
- [UEFI boot services and ExitBootServices](https://uefi.org/specs/UEFI/2.10/07_Services_Boot_Services.html)
- [UEFI image format](https://uefi.org/specs/UEFI/2.10/02_Overview.html)
