# Example: Creates a box with a cylinder extruded from the top.

import cadquery as cq

# Using parameters helps with customization of the model later
box_width = 30
box_depth = 20
box_height = 20
circle_radius = 5.0  # small enough to sit clearly within the box top
cylinder_height = 10.0

# The base box that other features can be added to
result = cq.Workplane("XY").box(box_width, box_depth, box_height)

# Do not use boolean operations (union, intersection, etc). For instance,
# do not create a cylinder and union it with the box. Create a circle on
# top of the box and extrude it.
result = (
    result
    .faces(">Z")  # Select the top face of the box
    .workplane()   # Create a workplane on the top face so that the feature can be added
    .circle(circle_radius)
    .extrude(cylinder_height)  # Extrude the circle to create the cylinder
)

# The following call can be used if running in CQ-editor
# show_object(result)