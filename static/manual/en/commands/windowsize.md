<!--window-->
WindowSize
==========

```eppabasic
Sub WindowSize(width As Integer, height As Integer)
```

Sets the size of the window to `width`x`height`.

Note that this function only changes the size of the window
and that the drawing area will be scaled to fit the window.

Drawing area size can be controlled using the function [Canvasize](manual:canvassize).

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
