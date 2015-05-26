<!--input-->
KeyHit
=====

```eppabasic
Function KeyHit(näppäin As Integer) As Boolean
```

Palauttaa tiedon, onko näppäin `näppäin` painettu alas viime framen aikana.

[Lista näppäinkoodeista](manual:keycodes)

Esimerkki
---------
```eppabasic
Do
    If KeyHit(ebKeySpace) Then
        Print "Painoit välilyöntiä"
    End If
    DrawScreen
Loop
```
