<!--graphics-->
FillCircle
==========

```eppabasic
Sub FillCircle(x As Integer, y As Integer, r As Integer)
```

Draws a filled circle with radius `r` on the screen at the coordinates (`x`, `y`).
Coordinates define the center of the circle.
The color to be used can be set using the command [FillColor](manual:fillcolor).

[See how coordinates work in EppaBasic](manual:/coordinates).

Example
----------
```eppabasic
' Draws a filled circle with center at (100, 120) and radius of 50 pixels
FillCircle 100, 120, 50
```
