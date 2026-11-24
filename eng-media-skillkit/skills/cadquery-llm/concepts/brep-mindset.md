# BRep vs CSG — The Core Mindset

## What BRep Is

**Boundary Representation (BRep)** defines a solid by its boundary: the faces, edges, and vertices
that enclose it. The interior is implied - it is whatever is inside those boundaries.

A BRep model has explicit **topology** (how faces connect to edges, edges connect to vertices)
and **geometry** (the actual surfaces and curves those topological entities lie on).

```
Solid
├── Shell (closed set of faces)
│   ├── Face (bounded region of a surface)
│   │   ├── Wire (closed loop of edges bounding the face)
│   │   │   └── Edge (bounded curve)
│   │   │       └── Vertex (point)
```

This hierarchy is what CadQuery exposes through selectors. When you write `.faces(">Z")`,
you are querying the topology of a BRep solid.

## What CSG Is

**Constructive Solid Geometry (CSG)** defines a solid as a tree of Boolean operations on primitives:

```
union
├── box(10, 10, 10)
└── cut
    ├── cylinder(r=3, h=15)
    └── box(5, 5, 5)
```

CSG is intuitive and maps well to how humans think about "adding" and "removing" material.
OpenSCAD is pure CSG. Many LLMs default to this mental model because most training examples use it.

## Why CadQuery Is Different

CadQuery's kernel (OpenCASCADE) is BRep-native. The model is always stored as BRep.
Boolean operations exist but are expensive — they recompute the entire boundary from scratch.

CadQuery's fluent API is designed around **working with existing topology**:
- Select a face → define a new workplane on it → sketch → extrude
- Select edges → apply fillet or chamfer directly
- Select a face → shell inward

These operations modify or extend the BRep directly, without rebuilding it from scratch.

## The Practical Difference

**CSG thinking** asks: *what shapes do I combine?*

**BRep thinking** asks: *what topology already exists, and what can I build from it?*

### Example: adding a boss to a plate

CSG approach:
```python
plate = cq.Workplane("XY").box(50, 50, 5)
boss = cq.Workplane("XY").cylinder(10, 8).translate((10, 10, 7.5))
result = plate.union(boss)
```

BRep approach:
```python
result = (
    cq.Workplane("XY")
    .box(50, 50, 5)
    .faces(">Z").workplane()
    .center(10, 10)
    .circle(8).extrude(10)
)
```

The BRep approach:
- Produces cleaner topology (no Boolean seam)
- Is faster to compute
- Keeps the chain readable
- Leaves faces available for further selection

### Example: hollowing a box

CSG approach:
```python
outer = cq.Workplane("XY").box(20, 20, 20)
inner = cq.Workplane("XY").box(16, 16, 20).translate((0, 0, 2))
result = outer.cut(inner)
```

BRep approach:
```python
result = cq.Workplane("XY").box(20, 20, 20).faces(">Z").shell(-2)
```

## When Booleans Are Appropriate

Not all Booleans are wrong. Use them when:

- Combining **separately constructed solids** that have no shared topology
- The geometry cannot be described as a profile operation (extrude/revolve/sweep/loft)
- Working with imported STEP/IGES geometry that you need to subtract from
- Using the Free Function API where operator syntax (`+`, `-`, `*`) is natural

Even then, in the Free Function API, prefer `addHole()` and `replace()` over cut() when
modifying individual faces — it avoids recomputing the full solid boundary.

## BRep Vocabulary in CadQuery

| Term | Meaning | CadQuery access |
|------|---------|-----------------|
| `Solid` | A closed volume | `.solids()` |
| `Shell` | A set of connected faces (may be open) | `.shells()` |
| `Face` | A bounded surface region | `.faces()` |
| `Wire` | A closed or open loop of edges | `.wires()` |
| `Edge` | A bounded curve | `.edges()` |
| `Vertex` | A point | `.vertices()` |
| `Compound` | A collection of any shapes | `.compounds()` |

Understanding this hierarchy is essential for writing correct selectors and knowing
which `.val()` / `.vals()` calls will return what type.
