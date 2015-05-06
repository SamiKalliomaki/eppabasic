<!--input-->
MouseHit
========

```eppabasic
Function MouseHit(button As Integer) As Boolean
```

Returns information whether mouse button has been pressed since the last call to the function.

Calling this function twice always returns False on the second call.

Button|Number
-------|------
Left|1
Right|2
Middle|3

Example
---------
```eppabasic
Do
    If MouseHit(1) Then
        Print "You pressed left mouse button"
    End If
    DrawScreen
Loop
```
