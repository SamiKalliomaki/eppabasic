<!--input-->
KeyUp
=====

```eppabasic
Function KeyUp(näppäin As Integer) As Boolean
```

Returns information whether key is not pressed down.

[List of key codes](manual:keycodes)

Example
---------
```eppabasic
Do
    ClearScreen
    If KeyUp(32) Then
        Print "You're not pressing spacebar"
    End If
    DrawScreen
Loop
```
