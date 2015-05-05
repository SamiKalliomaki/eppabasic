<!--graphics-->
DrawLine
==========

```eppabasic
Sub DrawLine(x1 As Integer, y1 As Integer, x2 As Integer, y2 As Integer)
```

Draws a line from coordinates (x1, y1) to coordinates (x2, y2).
The color to be used can be set using the command [DrawColor](manual:drawcolor).

[Katso, miten EppaBasicissa koordinaatisto toimii](manual:/coordinates).

Example
----------
```eppabasic
' Draw a line from coordinates (100, 120) to coordinates (300, 50)
DrawLine 100, 120, 300, 50
```
