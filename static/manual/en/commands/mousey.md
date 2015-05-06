<!--input-->
MouseY
======

```eppabasic
Function MouseY() As Integer
```

Returns the y coordinate of mouse cursor.

[See how coordinates work in EppaBasic](manual:/coordinates).

Example
---------
```eppabasic
Do
    ClearScreen
    Print MouseY()
    DrawScreen
Loop
```
