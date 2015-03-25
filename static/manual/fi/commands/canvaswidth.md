<!--window-->
CanvasWidth
============

```eppabasic
Sub CanvasWidth(leveys As Integer)
Function CanvasWidth() As Integer
```

Asettaa piirtoalueen leveydeksi `leveys` tai palauttaa piirtoalueen leveyden.

Huomaa, että funktio muuttaa vain piirtämiseen käytettävän alueen leveyttä
ja että piirtoalue skaalataan täyttämään ikkuna.

Ikkunan leveyttä voi hallita funktiolla [WindowWidth](manual:windowwidth).

Esimerkki
----------
```eppabasic
' Asetetaan ikkunan otsikko
WindowTitle "Esimerkkiohjelma"

Do
    ' Päivitetään piirtoalueen koko vastaamaan ikkunan kokoa
    CanvasWidth WindowWidth()
    CanvasHeight WindowHeight()

    ' Piirretään viiva vasemmasta yläkulmasta oikean laidan keskelle
    ClearScreen
    DrawLine 0, 0, CanvasWidth(), CanvasHeight() / 2
    DrawScreen
Loop
```
