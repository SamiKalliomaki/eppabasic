<!--input-->
KeyHit
=====

```eppabasic
Function KeyHit(näppäin As Integer) As Boolean
```

Returns information whether key has been pressed since the last call to the function.

Calling this function twice always returns False on the second call.

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
