# Cubes Game TI

OakBoot 0.2.0 compiles the existing Cubes Game TI Oak source without editing its imports or game code. In the directory containing `cubesgameti.oak`, run:

```powershell
oakboot.exe cubesgameti.oak --image cubesgameti.img --bare-metal --keyboard ps2
```

The default output is `cubesgameti.efi`, beside the source file. The font and every imported source module are included automatically. Neither the source, font file nor `lib` directory is required beside the compiled EFI program. Keep the source/assets in place on the compiler computer.

Use the PS/2 backend for genuine held-key state, shift shortcuts, keypad keys and pointer clicks on a compatible keyboard/mouse controller. Without these flags, the default firmware backend still compiles and boots the game, but its keyboard input is keystroke pulses. Physical USB devices require suitable firmware translation; a native USB HID state backend is still missing.

Program arguments are embedded at compile time because a booted program has no host process command line:

```powershell
oakboot.exe cubesgameti.oak --image cubesgameti.img --bare-metal --keyboard ps2 --arg --demo --arg --paused
```

The game keeps its normal full-display layout using `window_size()`. A tested QEMU configuration is `--resolution 1920x1080`; omit it to use firmware mode selection. Boot the image using `tooling/run-qemu.ps1`, or put the compiled EFI file at `EFI/BOOT/BOOTX64.EFI` on FAT32 boot media.

Verification calls the game's original `draw()` through a separate test wrapper, sends QEMU keyboard/mouse events and checks the resulting game state. It covers held movement/repeat, block placement/removal, pause, keyboard palette navigation, mouse palette selection, falling-block simulation, retained world data and 40 MiB of temporary allocation across frames. The default firmware backend and embedded `--demo` argument are also boot-tested. Source hashes confirm that the game files were not edited. Physical hardware validation remains missing.
