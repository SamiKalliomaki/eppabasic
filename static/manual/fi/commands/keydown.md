<!--input-->
KeyDown
=======

```eppabasic
Function KeyDown(näppäin As Integer) As Boolean
```

Palauttaa tiedon, onko näppäin `näppäin` painettuna alas.

[Lista näppäinkoodeista](manual:keycodes)

Esimerkki
---------
```eppabasic
Do
    ClearScreen
    If KeyDown(ebKeySpace) Then
        Print "Painat välilyöntiä"
    End If
    DrawScreen
Loop
```
