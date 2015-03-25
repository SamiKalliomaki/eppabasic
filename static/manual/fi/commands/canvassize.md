<!--window-->
CanvasSize
==========

```eppabasic
Sub CanvasSize(leveys As Integer, korkeus As Integer)
```

Asettaa piirtoalueen kooksi `leveys`x`korkeus`.

Huomaa, että funktio muuttaa vain piirtämiseen käytettävän alueen kokoa
ja että piirtoalue skaalataan täyttämään ikkuna.

Ikkunan kokoa voi hallita funktiolla [WindowSize](manual:windowsize).

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
