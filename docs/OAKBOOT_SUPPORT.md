# Support boundary

This is an executable preview, not a universal OakScript/PC backend. Unsupported language constructs and APIs produce target diagnostics. Supported graphics and input paths have been exercised under QEMU/OVMF; that does not establish physical motherboard compatibility.

| Area | Implemented | Missing or limited |
| --- | --- | --- |
| Execution | Optimized native x86-64 code, no VM/interpreter or OS imports | ARM, RISC-V, 32-bit x86, GPU kernels |
| Boot | x64 UEFI application, FAT32/MBR ESP image, optional `ExitBootServices` | Legacy BIOS/CSM, Secure Boot signature |
| Motherboards | Standard UEFI protocol backend; QEMU Q35 and PC tested | Physical ASUS/other board certification, board-specific fixes |
| Display | GOP RGB/BGR framebuffer, preferred EDID mode or largest firmware mode, exact resolution override | Modes firmware does not expose, PixelBitMask/BLT-only GOP, hotplug, multiple monitors |
| Drawing | `clear`, `set_pixel`, `fill_rect`, concave `fill_poly`, nearest-neighbor `texture_blit`, alpha blending | GPU acceleration, rotation/tint/regions, fonts, 3D, shaders/compute |
| Images | PNG/JPEG/BMP and other StbImageSharp formats decoded at compile time | Animated textures, texture samplers/filters, runtime-created images |
| Keyboard | Existing `key_down`, `key_pressed`, `key_released` names; PS/2 set-1 make/break, simultaneous keys | Native USB HID/xHCI driver; firmware input only produces 90 ms pulses |
| Sound | `beep(frequency, seconds)` through PIT/PC speaker | WAV/MP3/music, volume/mixing, HDA/HDMI/Bluetooth/USB output |
| Assets | Literal asset discovery, explicit include set for dynamic paths, embedded read-only virtual files, hashes | Runtime disk writes, generated/external files, network/filesystem discovery |
| Language | Scalars, numeric tuples/vectors, homogeneous lists, functions, basic types/methods, loops, conditionals | Full runner/native-compiler parity; details below |

## Language

Supported scalar types: signed 64-bit `int`, IEEE double `float`, `bool`, UTF-8 `string`, numeric vectors/colors and `texture`. Integer arithmetic is checked. Division/modulo use floor semantics. Boolean expressions short-circuit; comparison chains evaluate each reached operand once. `sin`/`cos` use a compact polynomial approximation rather than the host math library.

Declarations and assignments keep their initial type. Vectors support numeric component access and assignment. Homogeneous nonempty lists support creation, length, integer indexing and iteration. Mutable elements, slicing, heterogeneous/empty lists, list methods and returning lists are not implemented. Lists created during drawing are temporary and cannot be assigned to a global.

Functions accept fixed positional arguments, with optional type annotations. Untyped parameters specialize to each call's static argument types. Return types are inferred; recursion requires an explicit `->` type. Every path through a value-returning function must return a value. Global variables used by a function must have been declared before its first compiled call. Closures, nested functions, generators, decorators, keyword/default/rest arguments and function values are not supported.

Basic `type` declarations support typed fields, literal/tuple defaults, `@init(self,...)`, methods and stable object references. Objects allocate in the persistent arena. Inheritance, schemas, operator hooks, readonly-field writes and dynamic attributes are not supported. Types and module-level functions are declared before program initialization. `from "file.oak" import *` resolves relative source files transitively; aliases, selective/named package imports and independent module namespaces are not implemented. Import cycles produce an error. Imported symbols share a namespace, and duplicate declarations are rejected.

Automatic `draw()` and zero-argument `__main__()` are supported. A nonzero integer result from `__main__` fails the program. Manual loops can call `use_render(true)` and `render_screen()`. Timing uses the boot processor's TSC, calibrated against UEFI Stall before exit; `delta_time`, `time()` and `sleep(seconds)` are available. It uses one CPU core and does not enable interrupts after leaving firmware services. There is no scheduler, garbage collector or general exception/interrupt handler.

The implemented builtin set also includes `assert`, `exit`, `len`, numeric `int`/`float`/`bool`, `min`, `max`, `clamp`, `abs`, `floor`, `ceil`, `sqrt`, `sin`, `cos`, `vec2`/`vec3`/`vec4`/`color`, `window_open`, `close_window`, `screen_width`, `screen_height`, `window_width`, `window_height`, `print` and `println`. Printing is serial diagnostics after framebuffer initialization, not in-frame text. String `len` currently measures UTF-8 bytes. Strings are immutable. Disk/network/process calls and unsupported builtins fail compilation; there is no fallback to the Windows runner.

## Hardware requirements

An x64 UEFI system with an RGB/BGR GOP display and enough RAM for the program, a 64 MiB runtime arena, its embedded resources and the framebuffer canvas is required. Native monitor resolution is available only when firmware advertises it. Firmware code still initializes the GPU; this removes the need for an installed OS display driver, not the hardware-specific firmware itself. No vendor GPU instruction set or accelerated API is used.

The raw keyboard backend requires a controller exposing translated PS/2 set-1 scancodes at ports `0x60/0x64`. A native PS/2 keyboard is the most direct match. Whether a USB keyboard is translated this way depends on firmware and is not guaranteed. The compiler requires `--bare-metal --keyboard ps2` together so firmware cannot consume the same input stream. Firmware keystrokes cannot accurately reconstruct ordinary USB key-up events. Common letters/digits, arrows, space/enter/escape, modifiers, navigation keys and F1–F12 are mapped; international/media/keypad layouts are incomplete.

PC-speaker tones require a physical motherboard speaker/buzzer connected to a compatible PIT/speaker interface. Monitor/HDMI/headphone/laptop speakers are not supported by this backend. `beep` blocks for its duration. Do not interpret a silent motherboard as tested audio support.

The ELF/PE/boot formats and device instruction sets are distinct. The output is PE32+ EFI because that is the firmware-recognized boot format; renaming arbitrary flat bytes `.bin` does not make them bootable. There is no universal executable understood by all CPUs and GPUs.

## Memory and performance

Assets are read-only and immutable. Images are decoded ahead of time to avoid a runtime image library; the original file bytes and decoded pixels are both embedded. Each file is limited to 64 MiB, the raw asset set to 128 MiB and decoded texture data to 128 MiB. The default 64 MiB image imposes a smaller practical output size; a larger EFI can still be copied as a file to a larger FAT32 partition. Dimensions are capped at 16384, with a 256 MiB framebuffer-canvas limit.

Runtime allocation uses a checked 48 MiB persistent arena and 16 MiB frame arena. Frame lists are reclaimed at the start of the next frame. Objects created continuously consume persistent memory; this preview has no object reclamation. Capacity errors stop execution with a serial diagnostic. Avoid allocating persistent objects in an unbounded loop.

The framebuffer copy uses non-temporal x64 stores on BGR modes. Drawing runs on the CPU. Default presentation is capped at 60 frames/s using a timer wait; `--fps 0` uncaps it. Full-frame clears/copies scale with pixel count and memory bandwidth. The recorded benchmark is QEMU TCG emulation, not a physical-machine or vendor-GPU performance claim.

## Specification references

- [UEFI console, keyboard and GOP protocols](https://uefi.org/specs/UEFI/2.10/12_Protocols_Console_Support.html)
- [UEFI boot services and ExitBootServices](https://uefi.org/specs/UEFI/2.10/07_Services_Boot_Services.html)
- [UEFI image format](https://uefi.org/specs/UEFI/2.10/02_Overview.html)
