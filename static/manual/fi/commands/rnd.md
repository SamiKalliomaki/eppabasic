<!--math-->
Ceil
=====

```eppabasic
I)      Function Rnd() As Number
II)     Function Rnd(min As Integer, max As Integer) As Integer
```

I) Arpoo luvun suljetulta väliltä [0, 1].
II) Arpoo kokonaisluvun suljetulta välitä [min, max].

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
