# OakBoot 0.1.0 preview

OakBoot is a separate Windows EXE that compiles an OakScript subset into native x64 UEFI machine code with its runtime and assets in one `.efi`. It can also write a partitioned FAT32 boot-image file. The boot machine needs no OS, OakScript, .NET or runtime DLLs. The compiler uses installed MinGW-w64 x64 GCC.

Download the separate `OakBoot-0.1.0-win-x64.zip` asset from the [OakScript release](https://github.com/FIRECATCHER404/OakScript/releases/tag/v0.9.0). It includes examples, demo images, a QEMU launcher, validation evidence and a complete support boundary.

```powershell
.\oakboot.exe .\examples\boot-demo.oak -o demo.efi --image demo.img
.\oakboot.exe .\examples\boot-demo.oak -o demo-ps2.efi --image demo-ps2.img --bare-metal --keyboard ps2
```

Graphics use the CPU and firmware GOP framebuffer, preferring a monitor's EDID mode when exposed by firmware. Held-key/release controls require the PS/2 backend; firmware USB input is short keystroke pulses. Audio is limited to PIT/PC-speaker tones. GPU acceleration, native USB HID state handling, general audio playback, legacy BIOS, non-x64 targets and full language parity are missing. Physical ASUS and other motherboard compatibility remains unverified.

See the [setup and support page](https://oakscript-project.github.io/reference/oakboot.html). The Windows runner and its existing `oakscript compile` target remain separate.
