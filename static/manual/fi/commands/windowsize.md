<!--window-->
WindowSize
==========

```eppabasic
Sub WindowSize(leveys As Integer, korkeus As Integer)
```

Asettaa ikkunan kooksi `leveys`x`korkeus`.

Huomaa, että funktio muuttaa vain näkyvän ikkunan kokoa
ja että piirtoalue skaalataan täyttämään ikkuna.

Piirtoalueen kokoa voi hallita funktiolla [CanvasSize](manual:canvassize).

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
