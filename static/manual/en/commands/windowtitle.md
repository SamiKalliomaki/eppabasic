<!--window-->
WindowTitle
============

```eppabasic
Sub WindowTitile(title As String)
Function WindowTitile() As String
```

Sets the title of the window to `title` or returns the current title of the window.


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
