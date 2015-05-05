<!--graphics-->
DrawWidth
==========

```eppabasic
Sub DrawWidth(width As Integer)
```

Sets the width of line used when drawing lines and outlines of shapes to `width`.
Width is measured in pixels.

Example
----------
```eppabasic
' Draw lines of different widths
DrawWidth 1
DrawLine 50, 50, 200, 50

DrawWidth 2
DrawLine 50, 100, 200, 100

DrawWidth 5
DrawLine 50, 150, 200, 150

DrawWidth 10
DrawLine 50, 200, 200, 200
```
