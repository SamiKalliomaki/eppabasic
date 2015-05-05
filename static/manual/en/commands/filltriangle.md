<!--graphics-->
FillTriangle
============

```eppabasic
Sub FillTriangle(x1 As Integer, y1 As Integer, x2 As Integer, y2 As Integer, x3 As Integer, y3 As Integer)
```

Piirtää näytölle täytetyn kolmion.
Kolmion kärjet ovat koordinaateissa (`x1`, `y1`), (`x2`, `y2`) ja (`x3`, `y3`).
Käytettävä väri asetetaan komennolla [FillColor](manual:fillcolor).

[Katso, miten EppaBasicissa koordinaatisto toimii](manual:/coordinates).

Example
----------
```eppabasic
' Piirretään täytetty kolmio, jonka kärjet ovat koordinaateissa (50, 50), (100, 100) ja (40, 120).
FillTriangle 50, 50, 100, 100, 40, 120
```
