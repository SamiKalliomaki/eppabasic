<!--graphics-->
DrawCircle
==========

```eppabasic
Sub DrawCircle(x As Integer, y As Integer, r As Integer)
```

Draws a circle with radius `r` on the screen at the coordinates (`x`, `y`).
Coordinates define the center of the circle.
The color to be used can be set using the command [DrawColor](manual:drawcolor).

[See how coordinates work in EppaBasic](manual:/coordinates).

Example
----------
```eppabasic
' Draws a circle with center at (100, 120) and radius of 50 pixels
DrawCircle 100, 120, 50
```
