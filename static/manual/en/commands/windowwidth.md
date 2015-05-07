<!--window-->
WindowWidth
============

```eppabasic
Sub WindowWidth(width As Integer)
Function WindowWidth() As Integer
```

Sets the width of the window to `width` or returns the current width of the window.

Note that this function only changes the width of the window
and that the drawing area will be scaled to fit the window.

Drawing area width can be controlled using function [`CanvasWidth`](manual:canvaswidth).

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
