# Anti-Patterns

Common mistakes LLMs make when generating CadQuery code, and how to fix them.

---

## 1. The CSG Reflex — Booleans Instead of Feature Operations

The most pervasive anti-pattern: reaching for `.union()` / `.cut()` when a direct
feature operation would be cleaner, faster, and produce better topology.

| Instead of... | Use... |
|--------------|--------|
| `.union(cylinder(...))` for a boss | `.faces(...).workplane().circle(r).extrude(h)` |
| `.cut(cylinder(...))` for a hole | `.faces(...).hole(diameter)` |
| `.cut(box(...))` for a pocket | `.faces(...).workplane().rect(w, h).cutBlind(depth)` |
| `.union(...)` for a chamfered edge | `.edges(...).chamfer(d)` |
| `.union(...)` for a filleted edge | `.edges(...).fillet(r)` |
| `.cut(shell_solid)` to hollow | `.faces(...).shell(thickness)` |

Booleans rebuild the full boundary from scratch. Feature operations extend or modify
the existing BRep directly - they are faster and leave cleaner topology for subsequent
selections.

**Use booleans only when combining genuinely separate solids** or when the geometry
cannot be expressed as a profile operation.

---

## 2. Using `.translate()` on a Workplane Chain

`.translate()` is a method on `Shape` objects, not on `Workplane` objects. Calling it
in a fluent chain after building geometry moves the shape, but does so in global
coordinates — bypassing the workplane system entirely.

```python
# Wrong: translate is called on the Workplane, not the Shape
result = cq.Workplane("XY").box(10, 10, 10).translate((5, 0, 0))

# If you need to position geometry, use workplane placement instead
result = cq.Workplane("XY").center(5, 0).box(10, 10, 10)

# Or move the workplane origin explicitly
result = cq.Workplane(cq.Plane(origin=(5, 0, 0))).box(10, 10, 10)

# .translate() is valid when called on a Shape extracted from the chain
shape = cq.Workplane("XY").box(10, 10, 10).val()
moved = shape.translate(cq.Vector(5, 0, 0))
```

---

## 3. Building in Global Coordinates Instead of Using Workplanes

Hardcoding global coordinates creates scripts that are brittle and hard to modify.
Use workplanes and relative positioning instead.

```python
# Wrong: all positions hardcoded in global space
result = (
    cq.Workplane("XY")
    .box(30, 30, 10)
    .union(cq.Workplane("XY").cylinder(5, 8).translate((0, 0, 9)))
    .union(cq.Workplane("XY").cylinder(5, 8).translate((10, 10, 9)))
)

# Right: build relative to existing faces
result = (
    cq.Workplane("XY")
    .box(30, 30, 10)
    .faces(">Z").workplane()
    .circle(5).extrude(8)            # center boss
    .faces(">Z").workplane()
    .center(10, 10).circle(5).extrude(8)   # offset boss
)
```

---

## 4. Forgetting `combine=False` on `.extrude()`

By default, `.extrude()` unions the new solid with whatever is on the context stack.
If you want a separate solid (e.g., to combine later or export independently),
pass `combine=False`.

```python
# Default: extrusion is unioned into the existing solid
result = solid.faces(">Z").workplane().circle(3).extrude(5)

# Separate solid
new_part = cq.Workplane("XY").circle(3).extrude(5, combine=False)
```

The inverse mistake also occurs: forgetting that `combine=True` is the default,
and then trying to union the result again — producing a double union.

---

## 5. Misreading `.cutBlind()` Direction

`.cutBlind(depth)` cuts in the direction of the workplane normal. The normal points
**outward** from the selected face by default, so cutting from the top face without
inverting will cut away from the solid.

```python
# Wrong: cuts upward, away from the solid
solid.faces(">Z").workplane().rect(5, 5).cutBlind(3)

# Correct: invert=True flips the normal into the solid
solid.faces(">Z").workplane(invert=True).rect(5, 5).cutBlind(3)
```

Also applies to `.extrude(..., combine="cut")`.

---

## 6. `.val()` on a Multi-Item Stack

`.val()` returns the **first** item on the stack. It does not error if there are
multiple items - it silently discards the rest. Use `.vals()` when you need all items.

```python
solid = cq.Workplane("XY").box(10, 10, 10)

# Returns one Face - the first face in iteration order, not necessarily ">Z"
face = solid.faces().val()

# Returns all 6 faces as a list
faces = solid.faces().vals()

# To get a specific face as a Shape, select first
top_face = solid.faces(">Z").val()
```

---

## 7. Misusing `.each()`

`.each(callback)` calls `callback` on every item in the stack and **replaces the stack**
with the results. The callback must return a `Shape`. It is not for iteration with
side effects.

```python
# Wrong: callback doesn't return a Shape; result is undefined
solid.edges().each(lambda e: print(e.Length()))

# Wrong: trying to accumulate results
results = []
solid.faces().each(lambda f: results.append(f))  # each() ignores the return value None

# Right: use .each() to transform stack items
# e.g., get the center point of each face as a Vertex
centers = solid.faces().each(lambda f: f.Center())

# For iteration/inspection, use .vals() instead
for face in solid.faces().vals():
    print(face.Area())
```

---

## 8. Losing the Solid Context After a Selector

After `.faces(...)` or `.edges(...)`, the stack contains only the selected entities —
not the full solid. Calling `.workplane()` on a face selection is correct;
calling feature operations directly on the selection without a workplane can
silently use the wrong context.

```python
# Wrong: after .faces(), the solid is not the active context
solid.faces(">Z").box(5, 5, 3)   # adds a new box to the face selection context, not the solid

# Correct: use .workplane() to re-establish context for sketching
solid.faces(">Z").workplane().rect(5, 5).extrude(3)

# Correct: use .end() to return to the solid context
solid.faces(">Z").tag("top").end().faces("<Z").workplane().hole(3)
```

---

## 9. Assuming `centerOption` Default

The default `centerOption="ProjectedOrigin"` projects the parent workplane's origin
onto the new face - which is often not the face center and can place the origin
well outside the face bounds on irregular geometry.

```python
# Fragile: origin placement depends on face shape
solid.faces(">Z").workplane().circle(3).extrude(5)

# Explicit and predictable
solid.faces(">Z").workplane(centerOption="CenterOfBoundBox").circle(3).extrude(5)
```

---

## 10. Index Selector Fragility

Selectors like `">>Z[1]"` depend on a sorted count of all matching entities.
Adding fillets, chamfers, holes, or shells changes the entity count and can
silently shift which entity is selected.

```python
# Fragile: index may shift after any feature is added
solid.faces(">>Z[1]").workplane().hole(3)

# Robust: tag the face before adding features
solid = (
    cq.Workplane("XY")
    .box(20, 20, 20)
    .faces(">>Z[1]").tag("target")
    .end()
    .edges(">Z").fillet(1)          # this would shift the index above
    .faces(tag="target").workplane().hole(3)
)
```

---

## 11. Mixing Fluent and Free Function APIs Unintentionally

The two APIs are not interchangeable mid-script. A `Workplane` object is not
a `Shape`, and Free Function operations do not accept `Workplane` objects.

```python
from cadquery.func import *
import cadquery as cq

# Wrong: passing a Workplane to a free function
b = box(10, 10, 10)
wp = cq.Workplane("XY").box(5, 5, 5)
result = b + wp   # TypeError — wp is not a Shape

# Correct: extract the Shape from the Workplane first
wp_shape = cq.Workplane("XY").box(5, 5, 5).val()
result = b + wp_shape
```

When mixing is intentional, always extract with `.val()` or `.vals()` before
passing to Free Function API operations.

---

## 12. Unclosed Wires

When building a profile with `.lineTo()`, `.spline()`, `.threePointArc()`, etc.,
the wire must be closed before `.extrude()` or `.revolve()`. An unclosed wire
produces an error or unexpected open shell.

```python
# Wrong: missing .close()
result = (
    cq.Workplane("XY")
    .moveTo(0, 0)
    .lineTo(10, 0)
    .lineTo(10, 5)
    .lineTo(0, 5)
    .extrude(3)   # error - wire is not closed
)

# Correct
result = (
    cq.Workplane("XY")
    .moveTo(0, 0)
    .lineTo(10, 0)
    .lineTo(10, 5)
    .lineTo(0, 5)
    .close()
    .extrude(3)
)
```

---

## 13. Free Function API: Boolean in a Loop

Boolean operations in the Free Function API (and the fluent API) are expensive
because they recompute the full boundary. Never perform them in a loop.

```python
from cadquery.func import *

holes = [cylinder(0.5, 5).moved(x=i*2) for i in range(10)]

# Wrong: 10 sequential boolean operations
result = box(20, 5, 5)
for h in holes:
    result = result - h

# Correct: combine into a compound first, then subtract once
result = box(20, 5, 5) - compound(holes)
```

---

## 14. `BREP_API command not done` Errors

This error comes from the OpenCASCADE kernel and means a BRep operation could not be
completed geometrically. It is not a CadQuery bug — it means the requested geometry
is invalid or degenerate. The error message does not identify which operation failed.

**Common causes:**

### Fillet or chamfer radius too large

A fillet fails when its radius is larger than the shortest adjacent edge, or when
adjacent fillets overlap each other.

```python
# Fails if the box edge is shorter than radius=5, or if adjacent fillets intersect
solid.edges("|Z").fillet(5)   # BREP_API command not done
```

Fixes:
- Reduce the radius
- Fillet edges in separate calls, smallest features first
- Fillet different edge groups separately rather than all at once

```python
# Apply smaller fillets to shorter edges first
result = (
    cq.Workplane("XY")
    .box(20, 20, 5)
    .edges("|Z").fillet(1)      # vertical edges first
    .edges(">Z").fillet(0.5)    # then top perimeter with smaller radius
)
```

### Self-intersecting profiles

A profile (wire or sketch) that crosses itself cannot be extruded, revolved, or swept.
This includes profiles where an arc or spline curves back through the outline.

Check that:
- All `lineTo()` / `spline()` sequences form a simple (non-self-intersecting) closed loop
- Revolve profiles do not cross the axis of revolution
- Sweep profiles are small enough to navigate tight path curvature without self-intersection

### Self-intersecting sweep

A sweep fails when the profile is too large relative to the path curvature — the
extruded solid folds back on itself at tight bends.

Reduce the profile size or increase the path radius.

### Shell thickness too large

`.shell()` fails when the thickness is larger than the smallest local radius of
curvature — the offset surface self-intersects.

Reduce the shell thickness or simplify the geometry before shelling.

