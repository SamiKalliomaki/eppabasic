<!--graphics-->
FillTriangle
============

```eppabasic
Sub FillTriangle(x1 As Integer, y1 As Integer, x2 As Integer, y2 As Integer, x3 As Integer, y3 As Integer)
```

Draws a filled triangle to the screen.
The vertexes of the triangle are at coordinates (`x1`, `y1`), (`x2`, `y2`) and (`x3`, `y3`).
The color to be used can be set using the command [FillColor](manual:fillcolor).

[See how coordinates work in EppaBasic](manual:/coordinates).

Example
----------
```eppabasic
'  Draw a filled triangle that vertexes at coordinates (50, 50), (100, 100) and (40, 120).
FillTriangle 50, 50, 100, 100, 40, 120
```
