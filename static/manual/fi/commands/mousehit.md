<!--input-->
MouseHit
========

```eppabasic
Function MouseHit(näppäin As Integer) As Boolean
```

Palauttaa tiedon, onko hiiren näppäintä `näppäin` painettu funktion viimeisen kutsun jälkeen.

Funktion kutsuminen kahdesti peräkkäin palauttaa toisella kerralla aina arvon Epätosi.

Näppäin|Tunnus
-------|------
Vasen|1
Keskummäinen|2
Oikea|3

Esimerkki
---------
Do
    If MouseHit(1) Then
        Print "Painoit nappia"
    End If
    DrawScreen
Loop
```
