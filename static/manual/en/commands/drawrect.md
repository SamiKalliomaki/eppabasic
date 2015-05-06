<!--graphics-->
DrawRect
========

```eppabasic
Sub DrawRect(x As Integer, y As Integer, width As Integer, height As Integer)
```

Draws the outline of a rectangle that has width `width` and height `height`.
The rectangles left top corner is at coordinates (`x`, `y`).
The color to be used can be set using the command [DrawColor](manual:drawcolor).

[See how coordinates work in EppaBasic](manual:/coordinates).

Example
----------
```eppabasic
' Draw a hollow rectangle that has left top corner at (100, 120) and has width 300 and height 50
DrawRect 100, 120, 300, 50
```
