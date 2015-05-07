<!--window-->
WindowHeight
============

```eppabasic
Sub WindowHeight(height As Integer)
Function WindowHeight() As Integer
```

Sets the height of the window to `height` or returns the current height of the window.

Note that this function only changes the height of the window
and that the drawing area will be scaled to fit the window.

Drawing area height can be controlled using function [`CanvasHeight`](manual:canvasheight).

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
