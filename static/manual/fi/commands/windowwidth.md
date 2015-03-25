<!--window-->
WindowWidth
============

```eppabasic
Sub WindowWidth(leveys As Integer)
Function WindowWidth() As Integer
```

Asettaa ikkunan leveydeksi `leveys` tai palauttaa ikkunan leveyden.

Huomaa, että funktio muuttaa vain näkyvän ikkunan leveyttä
ja että piirtoalue skaalataan täyttämään ikkuna.

Piirtoalueen leveyttä voi hallita funktiolla [CanvasWidth](manual:canvaswidth).

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
