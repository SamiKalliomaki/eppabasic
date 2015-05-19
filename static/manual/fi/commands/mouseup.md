<!--input-->
MouseUp
=======

```eppabasic
Function MouseUp(näppäin As Integer) As Boolean
```

Palauttaa tiedon, onko hiiren näppäin `näppäin` nostettu ylös edellisen framen
aikana.

Näppäin|Tunnus
-------|------
Vasen|1
Oikea|2
Keskimmäinen|3

Esimerkki
---------
```eppabasic
Do
    If MouseUp(1) Then
        Print "Vasen nappi nostettu"
    End If
    If MouseUp(2) Then
        Print "Oikea nappi nostettu"
    End If
    If MouseUp(3) Then
        Print "Keskinappi nostettu"
    End If
    DrawScreen
Loop
```
