<!--graphics-->
FillRect
========

```eppabasic
Sub FillRect(x As Integer, y As Integer, width As Integer, height As Integer)
```

Draws a filled rectangle that has width `width` and height `height`.
The rectangles left top corner is at coordinates (`x`, `y`).
The color to be used can be set using the command [FillColor](manual:fillcolor).

[See how coordinates work in EppaBasic](manual:/coordinates).

Example
----------
```eppabasic
' Draw a filled rectangle that has left top corner at (100, 120) and has width 300 and height 50
FillRect 100, 120, 300, 50
```
