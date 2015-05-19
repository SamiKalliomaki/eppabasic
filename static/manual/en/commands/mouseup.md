<!--input-->
MouseUp
=======

```eppabasic
Function MouseUp(button As Integer) As Boolean
```

Returns information whether mouse button was released last frame.

Button|Number
-------|------
Left|1
Right|2
Middle|3

Example
---------
```eppabasic
Do
    If MouseUp(1) Then
        Print "Left button released"
    End If
    If MouseUp(2) Then
        Print "Right button released"
    End If
    If MouseUp(3) Then
        Print "Middle button released"
    End If
    DrawScreen
Loop
```
