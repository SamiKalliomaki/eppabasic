<!--input-->
KeyUp
=====

```eppabasic
Function KeyUp(näppäin As Integer) As Boolean
```

Palauttaa tiedon, onko näppäin `näppäin` nostettu ylös viime framen aikana.

[Lista näppäinkoodeista](manual:keycodes)

Esimerkki
---------
```eppabasic
Do
    If KeyUp(ebKeySpace) Then
        Print "Välilyönti nostettu ylös"
    End If
    DrawScreen
Loop
```
