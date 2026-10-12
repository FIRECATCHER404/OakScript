# Finding imported libraries

OakScript 0.7.0 resolves the complete import graph before running or generating
native code. Direct imports use their paths; named imports can use a JSON alias
map, local files, library search paths or installed packages.

Put `oaklibraries.json` beside your project, or in an ancestor directory:

```json
{
  "aliases": {
    "mathlib": "libraries/my_math.oak",
    "utilities": "C:/OakLibraries/utilities.oak"
  },
  "libpath": ["shared", "C:/OakLibraries"]
}
```

```oak
from mathlib import square
from utilities import first;second
from "../library.oak" import *
```

Relative JSON paths resolve beside the JSON file. Aliases are case-sensitive
module names mapped to `.oak` files or library directories with `main.oak`.
They are separate from export aliases such as `import square as squared`.
The nearest configuration to an importing file takes precedence; the entry
project's configuration also supplies aliases for external imported libraries.
Use `--libconfig FILE.json` to select one explicit configuration instead.
Invalid JSON, duplicate aliases and invalid field types fail with a diagnostic.

Add search directories or individual library files with `--libpath`:

```powershell
oakscript --libpath "C:/OakLibraries" main.oak
oakscript --libpath "C:/OakLibraries;D:/OtherLibraries" --check main.oak
oakscript --libpath "C:/OakLibraries/mathlib.oak" main.oak
oakscript --libpath "C:/One" --libpath "D:/Two" main.oak
oakscript compile main.oak -o main.exe --libpath "C:/OakLibraries"
oakscript compile main.oak --libconfig library-aliases.json -o main.exe
```

On Windows, join paths with semicolons; repeated flags also work. CLI paths
resolve from the terminal's working directory. Runner options precede the
source file; native compile options follow its source file. Arguments after a
runner's source filename are still ordinary script arguments.

Resolution order:

1. A named import's configured JSON alias, when its target exists.
2. The direct path or `NAME.oak` beside the importing file. Extensionless library
   directories can use `main.oak`.
3. CLI search paths in their supplied order, then JSON `libpath` entries.
   Direct `.oak` entries match their filename or a mapped alias's target filename.
   Directory searches preserve relative subpaths and also try the filename.
   Missing absolute imports can be relocated by filename.
4. An installed package in the entry project's `oak.lock.json`.
5. A previously selected missing library, then an interactive request for its
   file or directory if input is available.

An existing configured alias wins over a same-named local module. Explicit
`pkg:NAME` imports retain locked package resolution and require installation;
they do not silently switch to arbitrary source files. Imports never download
libraries automatically.

When a library is missing, an interactive CLI asks for its `.oak` file or
directory. Quoted paths are accepted, invalid selections can be retried, and
blank input cancels. A selection is retained for the current compilation/run;
it does not rewrite JSON. Use JSON or `--libpath` to make it persistent.

Piped/batch execution and redirected diagnostics fail without asking and report
the importing source location and searched paths. `--prompt-imports` explicitly
enables prompting even with redirected input; `--no-prompt-imports` disables it.
EOF terminates the prompt with an import error. Prompts use stderr, preserving
program stdout. The language server never prompts and automatically reads JSON
configuration for diagnostics, definitions and completion.

The same resolver is used by checking, both execution engines, bytecode
inspection, native compilation and imports inside `exec`/`evxec`. Resolved
modules keep their canonical identities, one-time initialization and their own
source-relative asset/file paths. Native output includes supported imported
code; source libraries are not required beside the compiled EXE. Data/assets
remain separate and use the existing native path rules.
