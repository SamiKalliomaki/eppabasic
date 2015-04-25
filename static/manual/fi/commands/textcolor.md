<!--graphics-->
TextColor
==========

```eppabasic
Sub TextColor(r As Integer, g As Integer, b As Integer)
```

Määrittää värin, jota käytetään tekstin piirtämiseen.

[Katso, miten värit toimivat EppaBasicissa](manual:../colors).

Esimerkki
----------
```eppabasic
' Piirretään teksti "Ohjelmointi on kivaa!" vihreällä
TextColor 0, 255, 0
DrawText 10, 20, "Ohjelmointi on kivaa!"
```
