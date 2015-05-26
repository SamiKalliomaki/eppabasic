<!--input-->
MouseHit
========

```eppabasic
Function MouseHit(näppäin As Integer) As Boolean
```

Palauttaa tiedon, onko hiiren näppäin `näppäin` painettu pohjaan edellisen
framen aikana.

Näppäin|Tunnus
-------|------
Vasen|1
Oikea|2
Keskimmäinen|3

Esimerkki
---------
```eppabasic
Do
    If MouseHit(1) Then
        Print "Painoit hiiren vasenta"
    End If
    DrawScreen
Loop
```
