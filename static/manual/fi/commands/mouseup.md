<!--input-->
MouseUp
=======

```eppabasic
Function MouseUp(näppäin As Integer) As Boolean
```

Palauttaa tiedon, onko hiiren näppäin `näppäin` ylhäällä.

Näppäin|Tunnus
-------|------
Vasen|1
Oikea|2
Keskimmäinen|3

Esimerkki
---------
```eppabasic
Do
    ClearScreen
    If MouseUp(1) Then
        Print "Vasen nappi ylhäällä"
    End If
    If MouseUp(2) Then
        Print "Oikea nappi ylhäällä"
    End If
    If MouseUp(3) Then
        Print "Keskinappi ylhäällä"
    End If
    DrawScreen
Loop
```
