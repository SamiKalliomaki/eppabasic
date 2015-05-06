<!--input-->
KeyDown
=======

```eppabasic
Function KeyDown(key As Integer) As Boolean
```

Returns information if key is pressed down.

[List of key codes](manual:keycodes)

Example
---------
```eppabasic
Do
    ClearScreen
    If KeyDown(32) Then
        Print "You're pressing spacebar"
    End If
    DrawScreen
Loop
```
