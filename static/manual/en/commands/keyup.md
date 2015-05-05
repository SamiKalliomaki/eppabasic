<!--input-->
KeyUp
=====

```eppabasic
Function KeyUp(näppäin As Integer) As Boolean
```

Palauttaa tiedon, onko näppäin `näppäin` ylhäällä.

[Lista näppäinkoodeista](manual:keycodes)

Example
---------
```eppabasic
Do
    ClearScreen
    If KeyUp(32) Then
        Print "Et paina välilyöntiä"
    End If
    DrawScreen
Loop
```
