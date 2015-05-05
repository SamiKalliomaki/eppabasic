<!--graphics-->
DrawRect
========

```eppabasic
Sub DrawRect(x As Integer, y As Integer, leveys As Integer, korkeus As Integer)
```

Piirtää näytölle suorakulmion, jonka leveys on `leveys` ja korkeus `korkeus`, ääriviivat.
Suorakulmion vasen yläkulma on koordinaateissa (`x`, `y`).
Käytettävä väri asetetaan komennolla [DrawColor](manual:drawcolor).

[Katso, miten EppaBasicissa koordinaatisto toimii](manual:/coordinates).

Example
----------
```eppabasic
' Piirretään ontto suorakulmio, jonka vasen yläkulma on pisteessä (100, 120) ja koko 300x50
DrawRect 100, 120, 300, 50
```
