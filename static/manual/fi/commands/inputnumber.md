<!--messages-->
InputNumber
===========

```eppabasic
Function InputNumber(viesti as String) As Number
```

Näyttää käyttäjälle viestin `viesti` ja pyytää häntä syöttämään luvun.
Jos käyttäjä ei kirjoita lukua, ohjelma kysyy käyttäjältä uudelleen.
Palauttaa käyttäjän kirjoittaman luvun.

Esimerkki
----------
```eppabasic
Dim luku = InputNumber("Anna luku:")
Message "Luvun neliöjuuri on " & Sqrt(luku)
```
