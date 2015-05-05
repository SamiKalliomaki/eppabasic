<!--graphics-->
DrawScreen
==========

```eppabasic
Sub DrawScreen()
```

Päivittää edellisen kutsun jälkeen piirretyt asiat näytölle.
Updates thing drawn since the last call on the screen.

When the command is called from a loop,
remember that the code of the loop is executed 60 times a second.

Example
----------
```eppabasic
' Short animation, where a circle travels across the screen
For i = 1 To 640
    ClearScreen
    FillCircle i, 200, 50
    DrawScreen
Next i
```
