# Selectors

Selectors filter the topology of a shape - faces, edges, wires, or vertices - down to the
subset you want to operate on. They work the same way in both the fluent API and the
Free Function API (as methods on Shape objects).

## Selector Syntax

Selectors are strings passed to `.faces()`, `.edges()`, `.wires()`, or `.vertices()`.

### Axis-based selectors

| Selector | Applies to | Meaning |
|----------|-----------|---------|
| `">X"` | faces, edges | Highest centroid along X |
| `"<X"` | faces, edges | Lowest centroid along X |
| `"\|X"` | faces | Normal is parallel to X axis (faces the ±X direction) |
| `"#X"` | faces, edges | Face normal or edge direction is orthogonal to X axis |
| `"+X"` | faces | Normal points in the +X direction |
| `"-X"` | faces | Normal points in the -X direction |

Replace `X` with `Y` or `Z` as needed.

### Sorted index selectors

`">>X[n]"` and `"<<X[n]"` sort entities by their centroid along an axis and pick by index (0-based).

```python
# Face with the second-highest Z centroid
solid.faces(">>Z[1]")

# Edge with the lowest X centroid
solid.edges("<<X[0]")
```

**Warning:** index selectors are fragile. Adding fillets, chamfers, or other features
changes the entity count and shifts indices. Prefer geometric selectors or tags.

### Type selectors

Filters by the geometric type of the surface or curve.

| Selector | Meaning |
|----------|---------|
| `"%Plane"` | Planar faces |
| `"%Cylinder"` | Cylindrical faces |
| `"%Cone"` | Conical faces |
| `"%Sphere"` | Spherical faces |
| `"%Torus"` | Toroidal faces |
| `"%Line"` | Linear edges |
| `"%Circle"` | Circular edges |

```python
# All cylindrical faces
solid.faces("%Cylinder")

# All circular edges
solid.edges("%Circle")
```

### Boolean combinators

| Syntax | Meaning |
|--------|---------|
| `"not >Z"` | All faces except the highest Z face |
| `">Z and \|X"` | Faces that are both highest Z AND normal parallel to X |
| `">Z or <Z"` | Top and bottom faces |

```python
# All faces except the top
solid.faces("not >Z")

# Edges that are both circular and on the top face - use chaining instead
solid.faces(">Z").edges("%Circle")
```

For complex filtering, chaining selectors (`.faces(...).edges(...)`) is clearer than
combining them in a single string.

## Tag-Based Selection

Tags are the most stable selection mechanism. They survive feature additions that would
shift index-based selectors.

```python
result = (
    cq.Workplane("XY")
    .box(20, 20, 10)
    .faces(">Z").tag("top")
    .end()
    .faces("<Z").tag("bottom")
    .end()
    .faces(tag="top").workplane().hole(4)
    .faces(tag="bottom").workplane().hole(2)
)
```

Tag early - as soon as a face or edge is created that you will need later.
Tags are stored on the Workplane object, not on the shape itself.

## Selectors in the Free Function API

Selectors work as methods on any Shape object - no Workplane needed.

```python
from cadquery.func import *

b = box(20, 20, 10)

top = b.faces(">Z")
top_edges = b.faces(">Z").edges("%Circle")
side_faces = b.faces("|Z")   # faces whose normal is parallel to Z i i.e. sides
```

The same selector strings work identically in both APIs.

## How Selectors Match

Understanding what a selector actually tests prevents subtle bugs.

### `">Z"` — highest centroid

Finds the entity whose **centroid** has the highest Z coordinate. On a simple box this
is the top face. On a complex solid it may not be the face you expect - the centroid
is the geometric center of the face area, not the highest point.

### `"|X"` — normal parallel to axis

Selects faces whose **outward normal** is parallel (in either direction) to the given axis.
On a box, `"|X"` gives both the left and right faces.

```python
# Both faces whose normal is parallel to X
solid.faces("|X")   # returns 2 faces on a box

# Just the face pointing in +X
solid.faces("+X")   # returns 1 face
```

### `"#X"` — orthogonal to axis

Selects faces whose **normal** is orthogonal to the given axis, or edges whose
**direction** is orthogonal to the given axis.

On a box, `#Z` gives the four side faces (normals point in X or Y, which are orthogonal to Z),
and the horizontal edges (direction lies in the XY plane, orthogonal to Z).

```python
# Side faces of a box (normals orthogonal to Z)
solid.faces("#Z")   # 4 side faces

# Horizontal edges (direction orthogonal to Z)
solid.edges("#Z")   # 8 horizontal edges on a box
```

Contrast with `|Z`, which selects entities whose normal or direction is **parallel** to Z
(top and bottom faces, vertical edges).

## Common Mistakes

### Expecting `">Z"` to return the topmost point

`">Z"` returns the face with the highest **centroid Z**, not the face containing
the highest Z vertex. On a slanted or irregular solid these can differ.

### Using `"|Z"` when you mean `">Z"`

`"|Z"` selects faces whose normal is parallel to Z - both top AND bottom faces on a box.
`">Z"` selects only the top face (highest centroid).

```python
solid.faces("|Z")   # top and bottom - probably not what you want
solid.faces(">Z")   # top face only
```

### Chaining selectors vs combining them

Two chained calls filter progressively; a combined string filters in one pass.
These are not always equivalent:

```python
# First selects all circular edges, then filters to those on >Z faces - may not work as expected
solid.edges("%Circle and >Z")

# Correct: select the top face first, then get its circular edges
solid.faces(">Z").edges("%Circle")
```

### Index selectors shifting after feature changes

```python
# Fragile: index 1 may shift after a fillet is added
solid.faces(">>Z[1]").workplane().hole(3)

# Stable: tag the face when you create it
solid.faces(">>Z[1]").tag("target").end()
# ... add fillets or other features ...
solid.faces(tag="target").workplane().hole(3)
```

