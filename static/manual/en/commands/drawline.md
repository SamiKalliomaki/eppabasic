<!--graphics-->
DrawLine
==========

```eppabasic
Sub DrawLine(x1 As Integer, y1 As Integer, x2 As Integer, y2 As Integer)
```

Piirtää näytölle viivan koordinaateista (x1, y1) koordinaatteihin (x2, y2).
Käytettävä väri asetetaan komennolla [DrawColor](manual:drawcolor).

[Katso, miten EppaBasicissa koordinaatisto toimii](manual:/coordinates).

Example
----------
```eppabasic
' Piirretään viiva pisteestä (100, 120) pisteeseen (300, 50)
DrawLine 100, 120, 300, 50
```
