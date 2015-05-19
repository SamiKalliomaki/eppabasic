<!--input-->
KeyHit
=====

```eppabasic
Function KeyHit(key As Integer) As Boolean
```

Returns information whether key was pressed down last frame.

[List of key codes](manual:keycodes)

Example
---------
```eppabasic
Do
    If KeyHit(ebKeySpace) Then
        Print "You've pressed spacebar"
    End If
    DrawScreen
Loop
```
