<!--structure-->
Function
========

```eppabasic
Function {nimi}({parametrit}) As {palautustyyppi}
    ' Koodia
End Function
```

Määrittelee oman funktion nimeltä `{nimi}`.

Funktion nimi voi muodostua kirjaimista, numeroista sekä alaviivoista.
Nimen ensimmäinen merkki ei saa olla numero.

`{parametrit}` määrittävät funktiolle annettavat parametrit.
`{parametrit}` on pilkuilla erotettu lista parametrejä.
Jokainen parametri on muotoa
```eppabasic
{nimi} As {tyyppi}
```
Vertaa [muuttujien määrittämiseen](manual:dim).

`{palautustyyppi}` määrittää funktion paluuarvon tyypin.
Funktion täytyy palauttaa arvo [Return](manual:return)-rakenteen avulla.

Esimerkki
---------
```eppabasic
' Funktio laskee summan 1+2+3+...+n
Function Summa(n As Number) As Number
    Dim s = 0
    For i = 1 To n
        s = s + i
    Next i
    Return s
End Function

' Funktiota voidaan käyttää näin
Print Summa(10)         ' 55
```
