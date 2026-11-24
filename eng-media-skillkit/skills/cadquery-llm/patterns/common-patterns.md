# Common Patterns

Idiomatic CadQuery recipes for tasks that come up frequently.
Each pattern shows the preferred approach and explains why.

---

## Fluent API Patterns

### Base solid with features on multiple faces

Build the base first, then add features face by face. Tag faces before adding
features that might change topology.

```python
import cadquery as cq

result = (
    cq.Workplane("XY")
    .box(40, 30, 15)
    .faces(">Z").tag("top")
    .faces("<Z").tag("bottom")
    .end()
    .faces(tag="top").workplane()
    .rect(20, 15).cutBlind(-5)          # pocket on top
    .faces(tag="bottom").workplane()
    .hole(6)                             # through hole from bottom
    .edges("|Z").fillet(2)               # fillet vertical edges last
)
```

### Polar pattern of features

Use `.polarArray()` to place features at equal angular intervals.

```python
result = (
    cq.Workplane("XY")
    .cylinder(5, 20)
    .faces(">Z").workplane()
    .polarArray(radius=8, startAngle=0, angle=360, count=6)
    .hole(2, depth=8)
)
```

### Rectangular pattern of features

Use `.rarray()` to place features in a grid.

```python
result = (
    cq.Workplane("XY")
    .box(40, 40, 10)
    .faces(">Z").workplane()
    .rarray(xSpacing=10, ySpacing=10, xCount=3, yCount=3, center=True)
    .hole(3, depth=8)
)
```

### Revolve a profile

Define the profile on a plane that includes the rotation axis, then revolve.
The axis is always on the X axis of the workplane by default.

```python
result = (
    cq.Workplane("XZ")
    .moveTo(5, 0)
    .lineTo(5, 10)
    .lineTo(8, 10)
    .lineTo(8, 6)
    .lineTo(5, 6)
    .close()
    .revolve(angleDegrees=360, axisStart=(0, 0, 0), axisEnd=(0, 1, 0))
)
```

### Sweep a profile along a path

Define the path, then the profile, then sweep. The profile is placed perpendicular
to the path at its start point.

```python
path = (
    cq.Workplane("XZ")
    .moveTo(0, 0)
    .spline([(10, 5), (20, 0)], includeCurrent=True)
)

result = (
    cq.Workplane("YZ")
    .circle(2)
    .sweep(path)
)
```

### Loft between profiles

Chain profiles on the same Workplane — each sketch pushed onto the stack before
`.loft()` becomes a section. Use `.workplane(offset=...)` to move between levels.

```python
result = (
    cq.Workplane("XY")
    .rect(20, 10)
    .workplane(offset=15)
    .circle(6)
    .loft()
)
```

### Shell a solid

Select the face(s) to open before calling `.shell()`. Negative thickness = inward.

```python
# Open-top box
result = cq.Workplane("XY").box(30, 20, 15).faces(">Z").shell(-2)

# Open on two opposite faces
result = cq.Workplane("XY").box(30, 20, 15).faces(">Z").shell(-2)
```

### Reusable sketch profile with `.placeSketch()`

Define the profile once and place it at multiple locations.

```python
slot = (
    cq.Sketch()
    .slot(8, 3)   # length, width
)

result = (
    cq.Workplane("XY")
    .box(40, 20, 8)
    .faces(">Z").workplane()
    .placeSketch(
        slot.moved(cq.Location((-10, 0, 0))),
        slot.moved(cq.Location((10, 0, 0))),
    )
    .cutBlind(-4)
)
```

### Selecting edges for fillet/chamfer

Fillet or chamfer specific edges by combining type and position selectors.

```python
result = (
    cq.Workplane("XY")
    .box(20, 20, 20)
    .edges(">Z").chamfer(1)          # top face perimeter edges
    .edges("<Z").fillet(2)           # bottom face perimeter edges
    .edges("|Z").fillet(1)           # vertical edges
)
```

---

## Free Function API Patterns

### Loft with curvature-continuous cap

Use `loft()` for the side and `cap()` (not `fill()`) for the top when you need
the top to maintain curvature continuity with the side surface.

```python
from cadquery.func import *

r = 5
h = 10

bottom = circle(r)
mid = circle(r * 1.3).moved(z=h * 0.5)
top_edge_guide = circle(r).moved(z=h)

side = loft(bottom, mid, top_edge_guide)
base = fill(side.edges("<Z"))
top = cap(side.edges(">Z"), side)   # curvature-continuous with side

result = solid(side, base, top)
```

### Adding a hole without a boolean

For performance on complex shapes, use `addHole()` instead of subtracting a cylinder.

```python
from cadquery.func import *

w = 1
r = 0.9*w/2

# box
b = box(w, w, w)
# bottom face
b_bot = b.faces('<Z')
# top faces
b_top = b.faces('>Z')

# inner face
inner = extrude(circle(r), (0,0,w))

# add holes to the bottom and top face
b_bot_hole = b_bot.addHole(inner.edges('<Z'))
b_top_hole = b_top.addHole(inner.edges('>Z'))

# construct the final solid
result = solid(
    b.remove(b_top, b_bot).faces(), #side faces
    b_bot_hole, # bottom with a hole
    inner, # inner cylinder face
    b_top_hole, # top with a hole
)
```

### Pattern with `.moved()`

Pass multiple location tuples to `.moved()` to create a compound of copies.

```python
from cadquery.func import *

peg = cylinder(2, 8)

# 4 pegs in a 2x2 grid
result = peg.moved(
    (-5, -5, 0),
    ( 5, -5, 0),
    (-5,  5, 0),
    ( 5,  5, 0),
)
```

### Boolean on 2D shapes

Boolean operators work on faces and wires, not just solids.
Useful for constructing profiles before extruding.

```python
from cadquery.func import *

outer = plane(20, 20)
cutout = plane(10, 10)

profile = outer - cutout   # frame-shaped face with hole
result = extrude(profile, (0, 0, 5))   # hollow frame solid
```

### Text along a spine

`text()` takes positional arguments — keyword args will fail multimethod dispatch.
For planar text, pass a line segment as the spine with `planar=True`.
For text projected onto a curved surface, see the full example in the CadQuery docs.

```python
from cadquery.func import *

from math import pi

# parameters
D = 5
H = 2*D
S = H/10
TH = S/10
TXT = "CadQuery"

c = cylinder(D, H).moved(rz=-135)
spine = (c*plane().moved(z=D)).edges().trim(pi/2, pi)

# planar
r1 = text(TXT, 1, spine, planar=True).moved(z=-S)
```

```

