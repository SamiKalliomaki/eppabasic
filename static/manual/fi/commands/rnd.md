<!--math-->
Rnd
===

```eppabasic
I)      Function Rnd() As Number
II)     Function Rnd(min As Integer, max As Integer) As Integer
```

I) Arpoo luvun suljetulta väliltä [0, 1].<br>
II) Arpoo kokonaisluvun suljetulta välitä [min, max]. Eli toisin sanoen kaikki luvut välillä min - max ovat mahdollisia mukaanlukien välin päätepisteet.

Esimerkki
---------
```eppabasic
' Tulostetaan 78% todennäköisyydellä "Moikka!" ja 22% todennäköisyydellä "Heippa!"
If Rnd() <= 0.78 Then
    Print "Moikka!"
Else
    Print "Heippa!"
End If
```
