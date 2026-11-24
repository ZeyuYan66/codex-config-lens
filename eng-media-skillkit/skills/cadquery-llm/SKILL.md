---
name: cadquery-llm
description: >-
  Write and review parametric CAD with CadQuery, including BRep modeling,
  workplanes, selectors, shells, fillets, lofts and printable STL/STEP export.
  Use for mechanical parts, holders, enclosures and 3D-printable CAD geometry.
license: Apache-2.0
---

<!-- Modified 2026-11-24 for Codex discovery; the mirrored API manual is replaced by its official website. -->
# CadQuery LLM Skill

This skill helps LLMs write correct, idiomatic CadQuery code.
Load this file before any CadQuery task. For deeper reference, read the files listed at the bottom.

---

## Two APIs — Know Which One You're Using

CadQuery provides two distinct APIs. Always identify which is appropriate before writing code.

### Fluent (Workplane) API
```python
import cadquery as cq
result = cq.Workplane("XY").box(10, 10, 10).faces(">Z").hole(3)
```
- Chains operations on a `Workplane` object with hidden state (current plane, stack)
- Best for: parts built up from sketches and feature operations (extrude, hole, fillet, shell)
- Most tutorials and examples use this style

### Free Function API
```python
from cadquery.func import *
b = box(10, 10, 10)
result = b - cylinder(1.5, 10)
```
- No hidden state — all operations are explicit free functions
- Selectors still work as methods on Shape objects
- Boolean ops available as operators: `+` (union), `-` (cut), `*` (intersect), `/` (split)
- Best for: complex face-by-face construction, lofted/swept surfaces, avoiding booleans via `addHole()`/`replace()`, parametric surface mapping
- More verbose but more explicit and composable

**Do not mix the two styles in the same script** unless you explicitly convert between them.
When the task involves building shapes face-by-face, lofting between non-planar edges, or
trimming surfaces in parametric space — prefer the Free Function API.

---

## The Core Mindset: BRep, Not CSG

CadQuery uses **Boundary Representation (BRep)**: a model is defined by its surfaces, edges, and vertices — not by Boolean operations on primitives.

The CSG reflex (union/cut everything) produces brittle, unidiomatic code. The BRep reflex asks:
- What faces, edges, or vertices already exist on this shape?
- Can I select them and build from there?
- Does a workplane operation (extrude, shell, fillet, chamfer) get me there without a Boolean?

**Wrong reflex (CSG):**
```python
result = base.union(cq.Workplane().box(10, 10, 5).translate((0, 0, 10)))
```

**Right reflex (BRep):**
```python
result = base.faces(">Z").workplane().rect(10, 10).extrude(5)
```

Only reach for `.union()`, `.cut()`, or `.intersect()` when you genuinely need to combine separate solids.

---

## Workplanes

A workplane is a local 2D coordinate system. Most geometry is created relative to it.

```python
import cadquery as cq

# Start on XY plane at origin
wp = cq.Workplane("XY")

# Build a solid to work from
cube = cq.Workplane("XY").box(10, 10, 10)

# Move to a face
wp2 = cube.faces(">Z").workplane()

# Offset from a face
wp3 = cube.faces(">Z").workplane(offset=5)

# Arbitrary origin and normal — must use cq.Plane, not keyword args on Workplane
wp4 = cq.Workplane(cq.Plane(origin=(0, 0, 10), normal=(0, 1, 0)))

# Move with transformation (rotate is degrees around local X, Y, Z)
wp5 = cube.faces(">Z").workplane().transformed(offset=(1, 2, 3), rotate=(0, 0, 45))
```

**Rules:**
- `.workplane()` resets the 2D origin to the center of the selected face/edge by default.
- `centerOption` controls what "center" means — the default `"ProjectedOrigin"` projects the parent workplane origin onto the new face, which is often not the face center. Always set it explicitly when position matters.
- After `.workplane()`, coordinates are **local** to that plane, not global.
- `.transformed()` is cumulative within the current workplane context.

---

## Selectors — Cheat Sheet

Selectors filter faces, edges, wires, or vertices from the current stack.

| Selector | Meaning |
|----------|---------|
| `">Z"` | Face/edge with highest Z centroid |
| `"<Z"` | Face/edge with lowest Z centroid |
| `"\|X"` | Faces whose normal is parallel to X axis |
| `"#Z"` | Faces/edges whose normal or direction is orthogonal to Z |
| `"+Z"` | Faces whose normal points in +Z direction |
| `">>Z[1]"` | Second item when sorted ascending by Z (0-indexed) |
| `"<<Z[0]"` | First item when sorted descending by Z |
| `"%Plane"` | Faces of type Plane (vs Cylinder, Cone, etc.) |
| `"not >Z"` | Inverts the selector |
| `">Z and \|X"` | Combines selectors (AND) |
| `">Z or <Z"` | Combines selectors (OR) |

**Tag-based selection (preferred for stability):**
```python
result = (
    cq.Workplane("XY")
    .box(10, 10, 10)
    .faces(">Z").tag("top")
    .end()
    .faces(tag="top").workplane().hole(3)
)
```

The code above demonstrates how to use tags, and is not a suggestion of the proper way to use them.
In practices you would not call `end` and then query the tagged face immediately again.
Use tags when the geometry might need to be referred to later, and may become hard to access.
Tagging can be very useful, but do not force it in to the script unless it seems needed.

---

## Critical Anti-Patterns


### 1. Boolean when a feature operation suffices
| Instead of... | Use... |
|--------------|--------|
| `.cut(cylinder)` | `.faces(...).hole(d)` |
| `.cut(shell_solid)` | `.shell(thickness)` |
| `.union(chamfered_edge)` | `.edges(...).chamfer(d)` |

### 2. workplane `centerOption` behaviors 
By default, a `workplane()` call uses `ProjectedOrigin` as the default, which uses the current origin and projects it onto the plan defined by the selected faces.
This usually works, but can cause unintended results sometimes.
If the geometric center of the object is the indended center for the operation, it can sometimes be better to use `CenterOfBoundBox`, which uses the X, Y and Z centers of the object's bounding box.
If the user mentions that the features added on the workplane are not in the expected position, one cause could be this `centerOption` parameter.
```python
# Explicit is always better
cq.Workplane("XY").box(10, 10, 5).faces(">Z").workplane(centerOption="CenterOfBoundBox")
```

### 3. Selector ordering assumptions
Selectors like `">>Z[1]"` depend on sort order across all matching entities. Adding fillets or other features changes the entity count and can shift indices. Prefer tags or geometric selectors (`">Z"`) over index-based ones.

### 4. Unclosed wires
When building profiles with `.lineTo()`, `.spline()`, etc., always call `.close()` before `.extrude()` or `.revolve()` unless the wire is intentionally open.

### 5. Forgetting `.end()` after tagging or selector context
After `.tag()` or navigating into a sub-context, use `.end()` to return to the solid before chaining further operations.

### 6. `BREP_API command not done`
This OpenCASCADE kernel error means the requested geometry is invalid. Common causes:
- Fillet/chamfer radius larger than the shortest adjacent edge, or adjacent fillets overlapping — reduce the radius or fillet edge groups separately
- Self-intersecting profile (wire crosses itself, revolve profile crosses the axis)
- Sweep profile too large for the path curvature — the solid folds back on itself
- Shell thickness larger than the local radius of curvature

See `patterns/anti-patterns.md` #14 for detailed fixes.

---

## Free Function API — Quick Reference

Import: `from cadquery.func import *`

**Primitives:**
```python
box(w, h, d)
cylinder(r, h)
sphere(r)
cone(r1, r2)
plane(w, h)          # flat face
circle(r)            # edge
rect(w, h)           # edge
segment((x1,y1,z1), (x2,y2,z2))
```

**Shape assembly:**
```python
wire(e1, e2, ...)         # edges → wire
face(wire)                # closed wire → face
solid(f1, f2, ...)        # faces → solid
shell(f1, f2, ...)        # faces → shell (open solid)
compound(s1, s2, ...)     # shapes → compound
```

**Operations:**
```python
extrude(profile, direction_vector)
loft(e1, e2, e3, cap=False)
sweep(profile, path)
revolve(face, axis_point, axis_dir, angle)
```

**Placement (no workplane needed):**
```python
shape.moved(x=1, y=2, z=3)           # translate
shape.moved(rx=90, ry=0, rz=45)      # rotate (degrees)
shape.moved((1,0,0), (0,1,0))        # place at multiple locations → compound
shape.move(z=5)                       # in-place variant
```

**Boolean operators:**
```python
a + b      # fuse / union
a - b      # cut / difference
a * b      # intersect
a / plane  # split
```

**Adding features without booleans (preferred for performance):**
```python
top = solid.faces(">Z")
inner = extrude(circle(r), (0, 0, h))
top_with_hole = top.addHole(inner.edges("<Z"))
result = solid(solid.remove(top).faces(), inner, top_with_hole)
```

**Selectors work the same way** — they are methods on Shape objects, not tied to either API.

---

## `.shell()` and Hollow Bodies

Shell operates on the existing solid — select the face(s) to open, then shell:

```python
box = cq.Workplane("XY").box(20, 20, 20)
hollow = box.faces(">Z").shell(-2)  # negative = inward
```

Common mistake: calling `.shell()` without first selecting which face to remove, resulting in a fully closed thin shell (usually not what you want).
Shell can be a little buggy with certain profiles, as can offsetting.

---

## For Deeper Reference

| Topic | File |
|-------|------|
| BRep vs CSG concepts | `concepts/brep-mindset.md` |
| Workplane (fluent) API | `concepts/workplanes.md` |
| Free Function API | `concepts/free-function-api.md` |
| Full selector reference | `concepts/selectors.md` |
| Idiomatic patterns | `patterns/common-patterns.md` |
| Anti-patterns (extended) | `patterns/anti-patterns.md` |
| Annotated examples | `examples/` |
| CadQuery API reference | [CadQuery documentation](https://cadquery.readthedocs.io/en/latest/) |

When working on a CadQuery task:
1. Read this file first.
2. If the task involves selectors, read `concepts/selectors.md`.
3. Grep `examples/` for methods you're unsure about: `grep -rn "\.shell\(" examples/`
4. Look up the installed version's API signatures in the official CadQuery documentation.
