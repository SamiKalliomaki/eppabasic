<!--graphics-->
DrawTriangle
============

```eppabasic
Sub DrawTriangle(x1 As Integer, y1 As Integer, x2 As Integer, y2 As Integer, x3 As Integer, y3 As Integer)
```

Piirtää näytölle kolmion ääriviivat.
Kolmion kärjet ovat koordinaateissa (`x1`, `y1`), (`x2`, `y2`) ja (`x3`, `y3`).
Käytettävä väri asetetaan komennolla [DrawColor](manual:drawcolor).

[Katso, miten EppaBasicissa koordinaatisto toimii](manual:/coordinates).

Esimerkki
----------
```eppabasic
' Piirretään ontto kolmio, jonka kärjet ovat koordinaateissa (50, 50), (100, 100) ja (40, 120).
DrawTriangle 50, 50, 100, 100, 40, 120
```
