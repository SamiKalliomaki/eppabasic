<!--window-->
CanvasHeight
============

```eppabasic
Sub CanvasHeight(korkeus As Integer)
Function CanvasHeight() As Integer
```

Asettaa piirtoalueen korkeudeksi `korkeus` tai palauttaa piirtoalueen korkeuden.

Huomaa, että funktio muuttaa vain piirtämiseen käytettävän alueen korkeutta
ja että piirtoalue skaalataan täyttämään ikkuna.

Ikkunan korkeutta voi hallita funktiolla [WindowHeight](manual:windowheight).

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
