# raygame

A small physics and path-tracing sandbox authored in OakScript. There are no
menus. The world starts with four physical light balls: red, green, blue and
white, plus some objects and a jointed dummy.

Run `Play.cmd` in the portable package, or:

```powershell
.\oakscript.exe main.oak
```

From the OakScript workspace, `dist\oakscript.exe raygame.oak` also works.
The package's `raygame.exe` is native machine code compiled from these same Oak
sources. `Play.cmd` uses it when available; `RunOak.cmd` uses the ordinary runner.
The current `main.oak` selects `use_cuda(true)`, requiring Windows x64 and an
NVIDIA GPU with a CUDA 12.8-capable display driver. Raygame's existing tracing
shaders run as OpenGL compute in this mode. Change that line to `use_cuda(false)`
to use Vulkan compute in the runner or OpenGL 4.3 compute in a native EXE.
Neither version needs a shader compiler to play. The SPIR-V shaders and font
are included.

The upper-right HUD shows FPS, averaged over half a second. It measures actual
rendered frame intervals rather than the fixed physics update rate.

| Input | Action |
| --- | --- |
| WASD | Move horizontally with camera yaw |
| Mouse | Look while captured |
| Space / Shift | Fly up / down |
| Wheel up / down | Previous / next placement type, with wrapping |
| Alt + wheel up / down | Increase / decrease paths per pixel per frame |
| Left click | Place the outlined object |
| Ctrl + left hold, then release | Charge and fire a smaller selected object |
| Right click | Delete the closest object under the crosshair |
| Escape | Toggle mouse capture; physics keeps running |
| Q | Quit |

Scrolling selects a **placement type**, never an existing object. Existing
objects cannot be selected, picked up or dragged. Deleting any part of a dummy
removes its whole ragdoll. The placement list contains Cube, Sphere, Capsule,
Mirror sphere, Jointed dummy, Red light sphere, Green light sphere, Blue light
sphere and White light sphere. Light spheres work like ordinary placements:
they have a matching outline preview, cannot intersect existing objects, and
have physics. Shift is only needed to fly
downward. New lights illuminate the scene
alongside the four startup lights. You can delete any light with right click;
deleted lights do not respawn.

World units are feet, seconds and kilograms. Placement raymarches the scene's signed distance
field. A surface in the exact viewing direction within **2 feet**, including the
ground, becomes the support surface. Otherwise the placement origin is exactly
2 feet down the viewing ray. The whole object's collider is checked, including
all thirteen dummy parts. Cyan outlines mean placement is valid; red outlines
mean the click will be rejected. A blocked fallback stays on the viewing ray
rather than moving the object somewhere else.

Hold either Ctrl key and press the left mouse button to charge a shot. Release
the mouse button to fire; releasing Ctrl first keeps the existing charge.
Shots use **35% of the normal dimensions**, with mass and inertia scaled to
retain density. Their launch speed is **6 + 12 × held seconds**, in feet per
second, directed along the camera's viewing ray. A miniature dummy keeps all
13 dynamic bodies and 12 scaled joints, and miniature light balls still emit
their dedicated color. The outline previews the shot at the muzzle and rejects
a blocked spawn. Escape, loss of focus/capture and quitting cancel a charge.

Every shot expires **60 real seconds after firing**, including sleeping shots.
An absolute deadline avoids accumulated timestep error. The first frame at or
after that deadline removes the whole object, its joints and its light entry.
Normal left-click placements remain full sized and permanent. Fixed objects
and torso-anchored dummies remain available through `add(...,true)` in the API.

All normal objects and dynamic light spheres have gravity, air drag and collisions. Gravity
is standard Earth's **9.80665 m/s²**, converted to **32.1740486 ft/s²** using
0.3048 meters per foot. The previous value was already an approximation of Earth
gravity; this makes the units explicit. See [NIST's standard gravity](https://physics.nist.gov/cgi-bin/cuu/Value?gn)
and [unit conversions](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors).
The world
floor is a static terrain collider. Physics uses a fixed 60 Hz step, oriented
boxes, spheres and capsules, quaternion angular motion, contact friction,
restitution and iterative compliant ball joints with bend limits. A dummy has
13 rigid bodies and 12 joints; it falls and collides rather than playing an
animation. Contacts cache accumulated support/friction impulses, retain box
face patches, and suppress restitution at resting speeds. Position correction
is separated from velocity so penetration cleanup cannot launch stacked boxes.
Joint anchors are constrained in both position and velocity. Whole touching
islands sleep together and wake on impacts or removal of their support.

Free fall uses trapezoidal integration, matching the constant-acceleration
trajectory in a vacuum. The accumulator advances the same simulation time at
12, 30, 60 or 120 rendering FPS; long pauses remain bounded at 0.25 seconds.
A normal cube is only 0.54 feet (about 16 cm) tall. Under Earth gravity a two-foot
fall takes about 0.35 seconds; these small objects naturally fall quickly.
Routine floor corrections do not restart resting limbs' sleep timers. Once
objects settle, physics leaves their poses and the scene revision unchanged,
allowing the renderer to keep accumulated lighting instead of starting over.
The library's fixed-placement API anchors a dummy's torso while its other
12 bodies retain gravity, collisions and angular motion, with all joints
connected. Ordinary placements and shots keep the whole dummy dynamic.
There are no object-specific native physics helpers or external physics engine.

Capsules start **exactly upright**, including their placement/shot outlines.
A perfectly symmetric drop can remain upright; impacts and torque can tip it.
A capsule lying on the floor has contacts under both rounded ends,
avoiding the false rocking torque from choosing only one end. It can roll with
spin. The fixed library API preserves its displayed starting pose.

Air resistance uses the [quadratic drag equation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-equation/)
with sea-level density of 1.225 kg/m³. Projected area accounts for shape and
orientation, and acceleration accounts for mass. The stable velocity update
slows a body without reversing it at large timesteps; the old 35 ft/s speed cap
has been removed. Spin has time-based damping. `world.air_density=0.0` gives a
vacuum; `body.drag_coefficient` and `body.angular_drag` tune individual bodies.
Defaults are 0.47 for spheres, 1.05 for boxes, 0.80 for capsules, and 0.35 per
second for spin damping. These are approximate game coefficients, not a fluid
simulation with wind, lift or Reynolds-number-dependent coefficients.

Dummy joints now solve their three coupled axes together, reusing inertia
calculations and applying one orientation correction per body. All 13 bodies,
12 joints, bend limits and five solver iterations remain. Physics skips settled
joint groups and distant floor checks, and returns early when everything is
asleep or fixed. Static contacts no longer wake resting bodies unnecessarily;
an impact wakes the connected dynamic parts while keeping an anchored torso fixed.

The velocity solver skips repeated support/joint passes once their residual
has converged, then retains its final four friction/joint passes. Difficult
contacts still receive the original maximum of 24 velocity passes. The five
position passes and all dummy bodies/joints remain.

Each integration and joint/contact position pass checks its proposed pose
before committing it. Swept bounding volumes and convex separation checks stop
fast bodies at contact, including when the destination is clear but the path
crosses an object. Floor/near-contact rotation checks find support-plane
crossings between clear endpoint poses. A blocked movement component is clipped;
small tangential movements are separately checked, and other parts can continue.
This follows the predictive [shape-cast/time-of-impact approach](https://box2d.org/documentation/md_collision.html),
implemented here in Oak for the game's 3D boxes, spheres and capsules. Existing
invalid initial overlaps still have a cleanup path; normal motion does not
move into a collider and then undo that move. `world.audit_motion=true` checks
every committed pose in tests, including all joint passes.

Each body has a `friction` value from 0 to 1. Cubes use 65%, spheres 35%,
capsules 55%, mirror spheres 5%, and light balls 20%. Every dummy part and the
floor use **100%**. A contact uses the **lower of the two values**, in either
order: the dummy can slide on a slippery object, and a slippery object can slide
on the dummy. This is finite frictional resistance, not a lock that makes bodies
static. Friction is separate from the material's visual `roughness`.

Rendering uses the built-in compute API. `trace.comp` performs analytic
world-space intersections, stochastic GGX/diffuse BSDF sampling, spherical
area-light sampling with multiple importance sampling, visibility rays and up
to four path bounces. Reflections therefore include off-screen scene geometry.
It is a GPU compute tracer, not a screen-space reflection effect or a CPU fake.
Conservative group bounds skip ray tests for a whole dummy when a ray misses its
enclosing sphere; surviving rays still test every relevant part. Group buffers
are reused and updated with scene revisions. Rays that drift from unit length
use the original exhaustive traversal, so the optimization preserves their hits.
In a stationary six-dummy scene at 1280x720 and 32 paths per pixel, three repeat
benchmarks took **69.5% less rendering time** (3.28x as fast). All 78 dummy parts
remain, and the resulting images match the original pixel for pixel. Rendering
a single dummy was effectively unchanged. A GPU comparison additionally checked
1.57 million ray hits and 131,072 complete light paths against exhaustive traversal.
This is not hardware DXR/Vulkan ray-query acceleration. `filter.comp` suppresses
isolated bright fireflies using a local median and median absolute deviation,
then performs three variance-guided a-trous passes at increasing pixel spacing.
The filter checks object identity, normals, distance to the surface tangent plane
and albedo to keep geometry and checkerboard edges sharp. Polished mirrors use a
narrower, weaker filter; emissive balls and placement outlines bypass it. Bloom
uses filtered lighting so rejected dots do not return as glow. `resolve.comp`
then applies HDR bloom, tone mapping and gamma conversion.

The tracer renders **1280x720** pixels in the 1280x720 window, four times the
previous 640x360 pixel count. The game starts at the user-configured **32 paths
per pixel per frame**, both moving and stationary. The standalone renderer
defaults to eight. It accumulates while the scene/camera remain still and resets
history on motion or edits. The original tracing and filtering shaders have
been restored; there is no automatic motion quality reduction. The denoiser is effective
at eight samples in the tested scene; moving scenes and difficult glossy
reflections can still contain noise. This small tracer uses finite bounce depth,
radiance clamping and spatial filtering rather than unbiased production rendering. Buffers, images and shader handles are reused. Graphics
stay on the GPU until an explicit test/capture asks for readback. Raw HDR history
is preserved; denoising uses two reusable scratch buffers and adds no CPU
readback. Its strength fades with measured uncertainty; a high sample count alone
does not disable the filter. Firefly rejection remains active at 514 or more
samples when lighting is still noisy. Zero-variance converged lighting stays
unchanged. `renderer.denoise=false` disables the display filter.
The increased pixel count requires more GPU work; `create(width,height)` in
`lib/render.oak` can still choose a smaller tracing resolution if needed.
`renderer.samples_per_frame` sets the positive number of paths per pixel per
frame; changing it resets history. The HUD reports the actual accumulated path
count and the current paths per frame. Hold either Alt key and scroll up to add
one path per notch or down to subtract one. The setting stops at **1** and has
**no upper cap**; this chord keeps the selected placement type unchanged.
More samples require more GPU work. Light sampling considers every active
emitter in a reusable GPU buffer, with one randomly selected light per path
bounce and the selection probability included in the lighting calculation.

Placement raymarching considers only the two-foot viewing segment, culls
off-ray bodies once, and reuses its result while the camera, catalog and scene
are unchanged. Right click still casts up to 80 feet for aimed deletion.
Clicks recheck collision safety before placing an object. These CPU changes
do not alter rendering quality.

For timing a particular scene, run `oakscript diagnostics.oak` in this folder,
or `oakscript examples/games/raygame/diagnostics.oak` from the workspace. This
runs the real controls and reports FPS, Oak draw work, awake bodies, actual
sample rate and camera position once per second. It adds no GPU readback.

The scene supports **192 rigid bodies**, including dummy parts. A full scene
rejects new placements and keeps existing objects. Large piles or many ragdolls
can reduce performance. The collision solver is iterative, so
small transient contact errors may occur during simulation; new placements are
checked for overlap before they are added. Sweeps prevent the tested fast
primitive bodies from crossing thin colliders; simultaneous many-body contact
timing is solved sequentially rather than as one global impact-time island.
There is no save/load, undo, object
dragging, or destruction of the world floor.

Files:

- `main.oak`: window and frame loop.
- `lib/world.oak`: bodies, catalog, dummy construction and deletion.
- `lib/geometry.oak`: signed distances, raymarching and narrow-phase contacts.
- `lib/physics.oak`: rigid-body/contact/joint solver.
- `lib/motion.oak`: predicted-pose collision sweeps and guarded movement.
- `lib/game.oak`, `lib/input.oak`: camera, placement and input.
- `lib/render.oak`: GPU resources, tracing dispatches and small HUD.
- `assets/shaders/*.comp`: editable GPU shader source and compiled `.spv`.
- `test.oak`: 313 assertions using the same gameplay/physics libraries.
- `shooting-test.oak`: charged-shot, lifetime and swept-collision checks.
- `diagnostics.oak`: normal gameplay with timing reports in the terminal.

From the source workspace, `python tooling/verify-raygame-denoise.py`
compares eight-sample GPU output against a 1024-sample reference and checks HDR
spike removal, object edges, emitter/outline preservation and unchanged history.
A local before/after comparison reduced floor error by about 74%, with measured
bright outliers dropping from 18 to zero in that test region.

Run `oakscript test.oak` and `oakscript shooting-test.oak` for model checks.
The latter verifies charge speed, all miniature types, absolute expiry and
predictive collision passes. From the source workspace,
`python tooling/verify-raygame.py` also checks hardware GPU lighting/shadows,
off-screen reflections, accumulation resets, and events injected into the test
process's own SDL window. These are not claims of manual physical input testing.

`python tooling/verify-raygame-shooting-native-input.py` checks both Ctrl keys,
held charging, release firing, dynamic miniature dummies and expiry cleanup in
the emitted native game. `python tooling/verify-raygame-shooting-render.py`
captures the upright capsules, miniature shots and charged outline with the
current renderer; physics is frozen in this visual fixture.

`python tooling/verify-raygame-accumulation.py` checks the actual startup scene
reaching rest, 514-sample frames accumulating up to 4112 samples, resets after
camera/scene/sample-rate edits, high-sample filtering and the FPS counter.
Add `--native` to compile and verify the same fixture with the native backend.

The bundled OakScript runner follows `LICENSE.txt`; third-party notices are
included. The Atkinson Hyperlegible font follows `assets/OFL.txt`.
