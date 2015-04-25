<!--graphics-->
TextAlign
=========

```eppabasic
Sub TextAlign(kohdistus As String)
```

Määrittää tekstiä piirrettäessä käytettävän tekstin kohdistuksen.
Kohdistus tarkoittaa kohtaa, johon komennolle
[DrawText](manual:drawtext) määritetty koordinaatti viittaa.

Parametrin `kohdistus` merkitykset:
Arvo|Merkitys
----|--------
1|Tasaus vasemmalle
2|Tasaus oikealle
3|Tasaus keskelle

Oletuksena teksti tasataan vasemmalle.

Esimerkki
----------
```eppabasic
' Piirretään teksti "Tekstiä!" käyttämällä erilaisia tasauksia.
TextSize 30
TextAlign 1
DrawText 100, 100, "Tekstiä!"
TextAlign 2
DrawText 100, 200, "Tekstiä!"
TextAlign 3
DrawText 100, 300, "Tekstiä!"
```
