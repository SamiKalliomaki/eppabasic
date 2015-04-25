<!--graphics-->
DrawColor
==========

```eppabasic
Sub DrawColor(r As Integer, g As Integer, b As Integer)
```

Määrittää värin, jota käytetään viivakuvioiden piirtämiseen.

[Katso, miten värit toimivat EppaBasicissa](manual:../colors).

Esimerkki
----------
```eppabasic
' Asetetaan piirtoväriksi sininen ja piirretään ontto ympyrä
DrawColor 255, 0, 0
DrawCircle 200, 200, 50
```
