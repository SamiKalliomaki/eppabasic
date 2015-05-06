<!--input-->
KeyHit
=====

```eppabasic
Function KeyHit(näppäin As Integer) As Boolean
```

Returns information if key has been pressed since the last call to the function.

Calling the function twice returns always False on the second call.

[List of key codes](manual:keycodes)

Example
---------
```eppabasic
Do
    If KeyHit(32) Then
        Print "You've pressed spacebar"
    End If
    DrawScreen
Loop
```
