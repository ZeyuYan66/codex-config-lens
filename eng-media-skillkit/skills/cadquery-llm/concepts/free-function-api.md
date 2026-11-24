# Free Function API

## Overview

The Free Function API provides an alternative to the fluent Workplane API.
It has no hidden state - every operation takes explicit inputs and returns explicit outputs.
Selectors still work as methods on Shape objects, but all other operations are free functions.

```python
from cadquery.func import *
```

Use this API when:
- Building shapes face-by-face or edge-by-edge
- Lofting between non-planar edges or constructing organic surfaces
- Avoiding booleans via `addHole()` / `replace()` for performance
- Working in parametric surface space (`trim()`, `edgeOn()`, `wireOn()`)
- The explicit, stateless style is clearer for the task at hand

---

## Primitives

All primitives return Shape objects that can be immediately operated on.

```python
from cadquery.func import *

e = segment((0, 0), (0, 1))     # line edge
c = circle(1)                    # circular edge
r = rect(2, 1)                   # rectangular wire
f = plane(1, 1.5)                # flat face
b = box(1, 1, 1)                 # solid box
cy = cylinder(1, 2)              # solid cylinder (radius, height)
sp = sphere(1)                   # solid sphere
co = cone(1, 1.5)                # solid cone (r1, r2)
```

Combine unrelated shapes into a compound for display or export:

```python
result = compound(e, c.moved(x=2), f.moved(x=4), b.moved(x=6))
```

---

## Shape Construction

Build higher-level shapes from lower-level ones.

```python
e1 = segment((0, 0), (1, 0))
e2 = segment((1, 0), (1, 1))

w = wire(e1, e2)           # edges → wire
f = face(circle(1))        # closed wire → face
s = solid(f1, f2, f3)      # faces → solid
sh = shell(f1, f2)         # faces → shell (open solid — use before solid() when sewing)
cp = compound(s1, s2)      # shapes → compound
```

**`solid()` vs `shell()`:** Use `solid()` when all faces are already properly connected.
Use `shell()` first to sew faces together when the topology needs explicit stitching
(e.g., when adding protrusions or working with trimmed surfaces).

---

## Operations

### Extrude

Accepts a wire or a face. Direction is a 3-tuple vector.

```python
r = rect(1, 0.5)
f = face(r)

s1 = extrude(r, (0, 0, 2))      # wire → solid with open ends
s2 = extrude(f, (0, 0, 1))      # face → closed solid
```

### Loft

Lofts through a sequence of edges or wires. `cap=True` closes the ends automatically.

```python
s = loft(circle(1), circle(1.5).moved(z=5), circle(1).moved(z=10))
s_capped = loft(rect(2, 1), circle(1).moved(z=5), cap=True)
```

For curvature-continuous end caps, use `cap()` instead of `fill()` after lofting:

```python
side = loft(circle(1), circle(1.3).moved(z=5), circle(1).moved(z=10))
base = fill(side.edges("<Z"))                  # flat cap — no curvature continuity
top  = cap(side.edges(">Z"), side)             # smooth cap — continuous with side
result = solid(side, base, top)
```

### Sweep

```python
profile = rect(0.5, 0.3)
path = segment((0, 0, 0), (0, 0, 10))   # straight path

result = sweep(profile, path)
```

Spline paths are supported - see the CadQuery docs and tests for the correct
`spline()` argument form, as dispatch is sensitive to argument types.

### Revolve

```python
# revolve(face, axis_point, axis_direction, angle_degrees)
f = face(rect(1, 0.5)).moved(x=2)
result = revolve(f, (0, 0, 0), (0, 1, 0), 90)
```

---

## Placement

The Free Function API has no workplane. Position shapes with `.moved()` and `.move()`.

```python
b = box(1, 1, 1)

b.moved(x=2)                    # translate
b.moved(rx=90)                  # rotate 90° around X (degrees)
b.moved(x=2, rz=45)             # translate and rotate
b.move(z=5)                     # in-place variant (modifies and returns self)
```

### Patterns - multiple locations in one call

Passing multiple position tuples to `.moved()` creates a **compound** of copies:

```python
peg = cylinder(1, 5)

result = peg.moved(
    (-5, -5, 0),
    ( 5, -5, 0),
    (-5,  5, 0),
    ( 5,  5, 0),
)   # compound of 4 pegs
```

### Face-relative placement

Select the face and use its geometry to derive position:

```python
b = box(20, 20, 10)
top = b.faces(">Z")
z = top.Center().z

boss = cylinder(3, 8).moved(z=z)
result = b + boss
```

---

## Boolean Operations

Boolean ops are available as both operators and free functions.
**Avoid booleans in loops** - they recompute the full boundary each time.

```python
c1 = cylinder(1, 2)
c2 = cylinder(0.5, 3)

r1 = c1 + c2          # union  (also: fuse(c1, c2))
r2 = c1 - c2          # cut    (also: cut(c1, c2))
r3 = c1 * c2          # intersect (also: intersect(c1, c2))
r4 = c1 / plane()     # split  (also: split(c1, plane()))
```

Boolean ops work on 2D shapes (faces, wires) as well as solids:

```python
outer = plane(20, 20)
inner = plane(10, 10)
frame = outer - inner          # face with a hole
result = extrude(frame, (0, 0, 5))
```

When unioning many shapes, combine into a compound first to reduce operation count:

```python
pins = [cylinder(0.5, 5).moved(x=i*1.5) for i in range(8)]
result = box(20, 5, 5) - compound(pins)   # one boolean, not 8
```

---

## Adding Features Without Booleans

For complex shapes where boolean performance matters, use `addHole()` and `replace()`
to modify individual faces directly rather than recomputing the full solid boundary.

```python
from cadquery.func import *

w = 1
r = 0.9 * w / 2

b = box(w, w, w)
b_bot = b.faces("<Z")
b_top = b.faces(">Z")

inner = extrude(circle(r), (0, 0, w))

b_bot_hole = b_bot.addHole(inner.edges("<Z"))
b_top_hole = b_top.addHole(inner.edges(">Z"))

result = solid(
    b.remove(b_top, b_bot).faces(),
    b_bot_hole,
    inner,
    b_top_hole,
)
```

For protrusions (adding material rather than removing it), sew with `shell()` first
to give the kernel enough context to stitch the new faces correctly:

```python
b = box(1, 1, 1)
b_top = b.faces(">Z")

feat_side = extrude(circle(0.4).moved(b_top.Center()), (0, 0, 0.2))
feat_top  = face(feat_side.edges(">Z"))
feat      = shell(feat_side, feat_top)   # sew into a shell first

b_top_hole = b_top.addHole(feat.edges("<Z"))
b = b.replace(b_top, b_top_hole)

sh = shell(b_top_hole, feat.faces("<Z"), ctx=(b, feat))
result = solid(sh)
```

---

## Text

`text()` uses multimethod dispatch — **all arguments must be positional**.
Keyword arguments will raise a `DispatchError`.

```python
from cadquery.func import *

# Planar text along a line
spine = segment((0, 0, 0), (30, 0, 0))
result = text("CadQuery", 3, spine, planar=True)

# Normal (projected) text along a spine on a surface
# See the CadQuery docs for the full surface projection example
```

---

## Parametric Surface Mapping

Advanced: trim faces and edges in parametric (u, v) space.

```python
from cadquery.func import cylinder, edgeOn, wire

base = cylinder(1.5, 3).faces("%CYLINDER")

# Rectangular trim
r = base.trim(-1.5, 0, 0, 1)

# Construct an edge in parametric space and trim with it
from math import pi
pcurve = edgeOn(base, [(0, 0.5), (pi, 0.5), (pi, 1.5), (0, 1.5)], periodic=True)
trimmed = base.trim(wire(pcurve))
```

Use `wireOn()` to map a 3D wire onto a surface, and `faceOn()` to map a face:

```python
from cadquery.func import sphere, text, faceOn

base = sphere(5).faces()
result = faceOn(base, text("CadQuery", 1))
```

---

## Selectors in the Free Function API

Selectors work identically to the fluent API — as string methods on any Shape object.

```python
b = box(20, 20, 10)

top       = b.faces(">Z")
side_faces = b.faces("#Z")
circ_edges = b.faces(">Z").edges("%Circle")
```

No Workplane is needed. The same selector strings, combinators, and tag syntax all apply.
See `concepts/selectors.md` for the full reference.
