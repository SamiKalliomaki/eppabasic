<!--graphics-->
DrawCircle
==========

```eppabasic
Sub DrawCircle(x As Integer, y As Integer, r As Integer)
```

Piirtää näytölle `r`-säteisen ympyrän ääriviivan koordinaatteihin (`x`, `y`).
Koordinaatit määrittävät ympyrän keskipisteen.
Käytettävä väri asetetaan komennolla [DrawColor](manual:drawcolor).

[Katso, miten koordinaatisto toimii EppaBasicissa](manual:/coordinates).

Esimerkki
----------
```eppabasic
' Piirretään pisteen (100, 120) ympärille ympyrä, jonka säde on 50
DrawCircle 100, 120, 50
```
