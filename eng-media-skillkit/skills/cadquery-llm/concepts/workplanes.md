# Workplanes

## What a Workplane Is

A workplane is a local 2D coordinate system attached to a point in 3D space.
All sketch operations (circles, rectangles, polygons, splines) are defined in this
local space, then extruded, revolved, swept, etc into 3D geometry.

The workplane has:
- An **origin** — the 2D (0, 0) point in 3D space
- An **x-direction** — defines the local X axis
- A **normal** — the Z axis of the local system (points "out" of the plane)

## Creating a Workplane

```python
import cadquery as cq

# Named planes — origin at (0,0,0)
wp1 = cq.Workplane("XY")   # normal = +Z
wp2 = cq.Workplane("YZ")   # normal = +X
wp3 = cq.Workplane("XZ")   # normal = +Y

# From a cq.Plane object - explicit origin and normal
wp4 = cq.Workplane(cq.Plane(origin=(0, 0, 10), normal=(0, 0, 1)))

# From an existing solid's face
wp5 = solid.faces(">Z").workplane()

# Offset along the face normal
wp6 = solid.faces(">Z").workplane(offset=5)
```

## Moving the Workplane

### `.workplane()` — attaches to selected geometry

After selecting a face or edge, `.workplane()` creates a new plane on that entity.
The origin defaults to the center of the selected entity (controlled by `centerOption`).

```python
result = (
    cq.Workplane("XY")
    .box(20, 20, 10)
    .faces(">Z").workplane()   # plane is now on the top face
    .circle(5).extrude(10)
)
```

### `.transformed()` — offsets and rotates the current plane

`.transformed()` moves the workplane relative to its current position.
Rotation is in degrees around the local X, Y, Z axes (applied in that order).

```python
result = (
    cq.Workplane("XY")
    .box(20, 20, 10)
    .faces(">Z").workplane()
    .transformed(offset=(5, 5, 0), rotate=(0, 0, 45))
    .rect(4, 4).extrude(3)
)
```

`.transformed()` is cumulative — each call moves relative to the current plane, not the global origin.

### `.center()` — shifts the 2D origin within the current plane

```python
solid.faces(">Z").workplane().center(10, 5).circle(3).extrude(5)
```

This shifts where (0, 0) is in the current plane. Useful for placing features
without recalculating coordinates manually.

## Placing a Sketch on a Workplane

Instead of building a profile directly in the fluent chain, you can define a `cq.Sketch`
independently and place it onto a workplane with `.placeSketch()`. This separates
profile definition from placement and allows the same sketch to be reused in multiple locations.

```python
import cadquery as cq

# Define the profile separately
profile = (
    cq.Sketch()
    .rect(10, 10)
    .circle(3, mode="s")   # subtract a circular hole from the rect
)

# Place it on a workplane and extrude
result = (
    cq.Workplane("XY")
    .box(30, 30, 5)
    .faces(">Z").workplane()
    .placeSketch(profile)
    .extrude(5)
)
```

Sketches can also be placed at multiple locations in a single call by passing
pre-moved sketch instances:

```python
s = cq.Sketch().circle(3)

result = (
    cq.Workplane("XY")
    .box(30, 30, 5)
    .faces(">Z").workplane()
    .placeSketch(
        s.moved(cq.Location((8, 8, 0))),
        s.moved(cq.Location((-8, -8, 0))),
    )
    .extrude(5)
)
```

The Sketch API also supports constraints, arcs, splines, and hull construction -
operations that are cumbersome or impossible to express in the fluent chain alone.
When a profile is complex, build it as a `cq.Sketch` and place it, rather than
trying to encode it inline.

## `centerOption` — Where the Origin Lands

When calling `.workplane()` on a selected face, `centerOption` controls the origin placement.

| Value | Origin location |
|-------|----------------|
| `"CenterOfMass"` | Center of mass of the face |
| `"CenterOfBoundBox"` | Center of the bounding box |
| `"ProjectedOrigin"` | Projects the parent workplane's origin onto the new plane (default) |

```python
# Explicit is always safer
solid.faces(">Z").workplane(centerOption="CenterOfBoundBox")
```

**Never assume the default matches your intent.** For symmetric faces it usually
doesn't matter, but for irregular faces it can place the origin far from where you expect.

## The Workplane Stack

The Workplane object maintains a stack of shapes. Operations push results onto the stack;
selectors filter the stack. This is how the fluent chain works.

```python
result = (
    cq.Workplane("XY")
    .box(20, 20, 10)        # stack: [box solid]
    .faces(">Z")            # stack: [top face]
    .workplane()            # stack: [top face], plane updated
    .circle(5)              # stack: [circle wire]
    .extrude(10)            # stack: [new solid]
)
```

Key rules:
- `.val()` returns the first item on the stack as a `Shape`
- `.vals()` returns all items on the stack as a list of `Shape`
- `.end(n)` pops `n` levels back up the chain (default 1)
- `.newObject(list)` replaces the stack with a new list

## Common Mistakes

### Forgetting that coordinates are local

After `.workplane()`, all coordinates are in the **local** frame, not global.

```python
# Wrong mental model: thinking (10, 10) is a global position
solid.faces(">Z").workplane().circle(3).extrude(5)   # circle at local (0,0) = face center

# Correct: use .center() or .transformed() to shift within the local frame
solid.faces(">Z").workplane().center(10, 10).circle(3).extrude(5)
```

### Losing context after `.tag()`

`.tag()` records the current stack state but does not change it.
After tagging, chain `.end()` to return to the solid before continuing.

```python
result = (
    cq.Workplane("XY")
    .box(20, 20, 10)
    .faces(">Z").tag("top")
    .end()                          # back to the solid
    .faces("<Z").workplane().hole(4)
)
```

### Cut going the wrong direction — forgetting `invert=True`

The workplane normal points **outward** from the selected face by default.
Cut operations (`.cutBlind()`, `.extrude(..., combine="cut")`) remove material
in the direction of the normal - so cutting from the top face will cut upward,
away from the solid, removing nothing.

Use `invert=True` to flip the normal inward when you need to cut into the solid
from an outward-facing face:

```python
# Wrong: cuts upward away from the solid — no material removed
solid.faces(">Z").workplane().circle(3).cutBlind(5)

# Correct: invert flips the normal to point into the solid
solid.faces(">Z").workplane(invert=True).circle(3).cutBlind(5)
```

This also applies to extrusions where you want to build downward (into the solid)
rather than upward. When in doubt, check which direction the face normal points
relative to the solid's interior.

### Operating on a face without creating a workplane

After selecting a face, some operations (`.hole()`, `.shell()`, `.fillet()`) work
directly on the selected geometry without needing a workplane. Others require one.
Skipping `.workplane()` when it is needed will silently use whatever plane was
active before the face selection, producing geometry in the wrong position or orientation.

```python
# Fine - .hole() works directly on the selected face
solid.faces(">Z").hole(3)

# Fine - .shell() operates on the selected face
solid.faces(">Z").shell(-2)

# Wrong - .circle().extrude() needs a workplane; this uses the previous plane context
solid.faces(">Z").circle(3).extrude(5)

# Correct
solid.faces(">Z").workplane().circle(3).extrude(5)
```

When in doubt, always call `.workplane()` after a face selection before sketching.

### Using `.workplane()` without a prior face selection

Calling `.workplane()` without first selecting a face creates a plane at the
center of whatever is on the stack - often not what you want.
Always select a face first.

```python
# Ambiguous
solid.workplane().circle(3).extrude(5)

# Explicit
solid.faces(">Z").workplane().circle(3).extrude(5)
```

## Workplanes in the Free Function API

The Free Function API has no workplane concept. Placement is done with `.moved()` and `.move()`.

```python
from cadquery.func import *

b = box(20, 20, 10)

# Place a feature by moving it to the right position, then fuse or addHole
boss = cylinder(5, 10).moved(z=10)   # sits on top of the box
result = b + boss
```

For face-relative placement, select the face and use its properties:

```python
top = b.faces(">Z")
origin = top.Center()   # returns a Vector
boss = cylinder(5, 10).moved(z=origin.z)
result = b + boss
```
