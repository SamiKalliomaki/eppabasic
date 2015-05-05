<!--input-->
KeyDown
=======

```eppabasic
Function KeyDown(näppäin As Integer) As Boolean
```

Palauttaa tiedon, onko näppäin `näppäin` painettuna alas.

[Lista näppäinkoodeista](manual:keycodes)

Example
---------
```eppabasic
Do
    ClearScreen
    If KeyDown(32) Then
        Print "Painat välilyöntiä"
    End If
    DrawScreen
Loop
```
