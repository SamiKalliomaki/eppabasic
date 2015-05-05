<!--graphics-->
FillCircle
==========

```eppabasic
Sub FillCircle(x As Integer, y As Integer, r As Integer)
```

Piirtää näytölle `r`-säteisen täytetyn ympyrän koordinaatteihin (`x`, `y`).
Koordinaatit määrittävät ympyrän keskipisteen.
Käytettävä väri asetetaan komennolla [FillColor](manual:fillcolor).

[Katso, miten EppaBasicissa koordinaatisto toimii](manual:/coordinates).

Example
----------
```eppabasic
' Piirretään pisteen (100, 120) ympärille täytetty ympyrä, jonka säde on 50
FillCircle 100, 120, 50
```
