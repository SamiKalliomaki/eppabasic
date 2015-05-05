<!--window-->
WindowHeight
============

```eppabasic
Sub WindowHeight(korkeus As Integer)
Function WindowHeight() As Integer
```

Asettaa ikkunan korkeudeksi `korkeus` tai palauttaa ikkunan korkeuden.

Huomaa, että funktio muuttaa vain näkyvän ikkunan korkeutta
ja että piirtoalue skaalataan täyttämään ikkuna.

Piirtoalueen korkeutta voi hallita funktiolla [CanvasHeight](manual:canvasheight).

Example
----------
```eppabasic
' Asetetaan ikkunan otsikko
WindowTitle "Exampleohjelma"

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
