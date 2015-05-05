<!--input-->
MouseHit
========

```eppabasic
Function MouseHit(näppäin As Integer) As Boolean
```

Palauttaa tiedon, onko hiiren näppäintä `näppäin` painettu funktion viimeisen kutsun jälkeen.

Funktion kutsuminen kahdesti peräkkäin palauttaa toisella kerralla aina arvon False.

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
        Print "Painoit nappia"
    End If
    DrawScreen
Loop
```
