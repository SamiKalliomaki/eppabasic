<!--window-->
CanvasWidth
============

```eppabasic
Sub CanvasWidth(width As Integer)
Function CanvasWidth() As Integer
```

Sets the width of the drawing area as `width` or returns the current width of
the drawing area.

Note that this function only changes the width of the drawing area and
that the drawing area is scaled to fit the window.

Window width can be controlled using the function [WindowWidth](manual:windowheight).

Example
----------
```eppabasic
' Sets the title of the window
WindowTitle "Example program"

Do
    ' Updates the drawing area to match the size of the window
    CanvasWidth WindowWidth()
    CanvasHeight WindowHeight()

    ' Draw a line from left top corner to the middle of the right edge
    ClearScreen
    DrawLine 0, 0, CanvasWidth(), CanvasHeight() / 2
    DrawScreen
Loop
```
