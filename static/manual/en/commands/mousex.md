<!--input-->
MouseX
======

```eppabasic
Function MouseX() As Integer
```

Returns the x coordinate of mouse cursor.

[See how coordinates work in EppaBasic](manual:/coordinates).

Example
---------
```eppabasic
Do
    ClearScreen
    Print MouseX()
    DrawScreen
Loop
```
