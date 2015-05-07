<!--window-->
CanvasSize
==========

```eppabasic
Sub CanvasSize(width As Integer, height As Integer)
```

Sets the size of the drawing area to `width`x`height`.

Note that this function only changes the size of the drawing area and
that the drawing area is scaled to fit the window.

Window size can be controlled using the function [WindowSize](manual:windowsize).

Example
----------
```eppabasic
' Sets the title of the window
WindowTitle "Example program"

Do
    ' Updates the drawing area to match the size of the window
    CanvasSize WindowWidth(), WindowHeight()

    ' Draw a line from left top corner to the middle of the right edge
    ClearScreen
    DrawLine 0, 0, CanvasWidth(), CanvasHeight() / 2
    DrawScreen
Loop
```
