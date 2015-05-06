<!--input-->
MouseDown
=========

```eppabasic
Function MouseDown(button As Integer) As Boolean
```

Returns whether mouse button is pressed down.

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
    If MouseDown(1) Then
        Print "Left button down"
    End If
    If MouseDown(2) Then
        Print "Right button down"
    End If
    If MouseDown(3) Then
        Print "Middle button down"
    End If
    DrawScreen
Loop
```
