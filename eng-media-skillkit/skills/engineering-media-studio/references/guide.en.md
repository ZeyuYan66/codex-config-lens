# Engineering coursework and demos

[简体中文](../SKILL.md)

Start with what the user needs to submit. A dimensioned drawing, a result backed by measurements, or a short video that makes the experiment observable may each be the right deliverable.

| Deliverable | Starting point | Verification |
| --- | --- | --- |
| Bracket, enclosure, or assembly | Use `cadquery-llm` if installed. Record hole spacing, wall thickness, and the clearance a connector needs. Mark dimensions as measured or estimated. | Read back the STEP or STL and check units, bounds, and hole positions. Assess print feasibility using the actual material, nozzle, and slicer preview. |
| Lab data and report | Preserve the raw data. Confirm units, measured quantities, and the time reference. Count missing, clipped, or duplicate samples separately. Choose a plot that answers the lab question. | Label units, sample counts, and processing methods. Check one real row by hand and keep the script or formula that regenerates the figure. |
| Embedded hardware demo | Track expected firmware behavior, serial logs, and visible observations. Tie each reported performance number to a measurement. | If the board is unavailable, provide checks that can run on the host and mark which results need confirmation on hardware. |
| Short lab video | Use `lab-demo-edit` to arrange shots around the question, the measurement, and what happened. Use the observed results in both the footage and captions. | Review the first and last frames, cuts, readability, audio, and duration. Provide the shot list and subtitles, with a rendered video when requested. |

Use the relevant installed tools. If a specialized program is unavailable, complete the parts that can be checked, such as a dimension sheet, data review, or shot list. Keep filenames and time offsets with references to the original data and footage.
