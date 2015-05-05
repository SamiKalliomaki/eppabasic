<!--structure-->
Sub
====

```eppabasic
Sub {nimi}({parametrit})
    ' Koodia
End Sub
```

Määrittelee oman aliohjelman nimeltä `{nimi}`.

Aliohjelman nimi voi muodostua kirjaimista, numeroista sekä alaviivoista.
Nimen ensimmäinen merkki ei saa olla numero.

`{parametrit}` määrittävät aliohjelmalle annettavat parametrit.
`{parametrit}` on pilkuilla erotettu lista parametrejä.
Jokainen parametri on muotoa
```eppabasic
{nimi} As {tyyppi}
```
Vertaa [muuttujien määrittämiseen](manual:dim).

Aliohjelman suorituksen voi keskeyttää kutsumalla aliohjelman sisällä [Return](manual:return)-rakennetta.

Esimerkki
---------
```eppabasic
' Aliohjelma piirtää n ympyrää riviin
Sub PiirräYmpyrät(n As Number)
    For i = 1 To n
        FillCircle 50*i, 50, 15
    Next i
End Sub

' Aliohjelmaa voi käyttää näin
PiirräYmpyrät 5
' Tai näin
PiirräYmpyrät(5)
```
