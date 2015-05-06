<!--input-->
MouseUp
=======

```eppabasic
Function MouseUp(button As Integer) As Boolean
```

Returns information whether mouse button is not pressed down.

Button|Number
-------|------
Left|1
Right|2
Middle|3

Example
---------
```eppabasic
Do
    ClearScreen
    If MouseUp(1) Then
        Print "Left button up"
    End If
    If MouseUp(2) Then
        Print "Right button up"
    End If
    If MouseUp(3) Then
        Print "Middle button up"
    End If
    DrawScreen
Loop
```
