<!--graphics-->
FillRect
========

```eppabasic
Sub FillRect(x As Integer, y As Integer, leveys As Integer, korkeus As Integer)
```

Piirtää näytölle täytetyn suorakulmion, jonka leveys on `leveys` ja korkeus `korkeus`.
Suorakulmion vasen yläkulma on koordinaateissa (`x`, `y`).
Käytettävä väri asetetaan komennolla [FillColor](manual:fillcolor).

[See how coordinates work in EppaBasic](manual:/coordinates).

Example
----------
```eppabasic
' Piirretään täytetty suorakulmio, jonka vasen yläkulma on pisteessä (100, 120) ja koko 300x50
FillRect 100, 120, 300, 50
```
