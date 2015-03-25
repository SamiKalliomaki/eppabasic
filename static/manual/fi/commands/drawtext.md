<!--graphics-->
DrawText
========

```eppabasic
Sub DrawText(x As Integer, y As Integer, teksti As String)
Sub DrawText(x As Integer, y As Integer, teksti As String, kohdistus As Integer)
```

Piirtää tekstin `teksti` näytölle koordinaatteihin (`x`, `y`).
Käytettävä väri asetetaan komennolla [TextColor](manual:textcolor).
Käytettävä kirjaisin asetetaan komennolla [TextFont](manual:textfont).
Käytettävä koko asetetaan komennolla [TextSize](manual:textsize).

Jos parametria `kohdistus` ei anneta, käytetään komennolla
[TextAlign](manual:textalign) asetettua kohdistusta.

Katso [TextAlign](manual:textalign) saadaksesi lisätietoa tekstin kohdistamisesta.
[Katso, miten EppaBasicissa koordinaatisto toimii](manual:/coordinates).


Esimerkki
----------
```eppabasic
' Piirretään teksti "Ohjelmointi on kivaa!" kohtaan (10, 20)
DrawText 10, 20, "Ohjelmointi on kivaa!"
```
