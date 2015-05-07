<!--window-->
CanvasHeight
============

```eppabasic
Sub CanvasHeight(height As Integer)
Function CanvasHeight() As Integer
```

Sets the height of the drawing area as `height` or returns the current height of
the drawing area.

Note that this function only changes the height of the drawing area and
that the drawing area is scaled to fit the window.

Window height can be controlled using the function [WindowHeight](manual:windowheight).

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
