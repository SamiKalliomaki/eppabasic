<!--graphics-->
Print
=====

```eppabasic
Sub Print(teksti As String)
```

Piirtää tekstin `teksti` näytölle.

Ensimmäisellä kutsukerralla funktio tulostaa tekstin kohtaan, joka on määritelty funktiolla [PrintLocation](manual:printlocation) (oletuksena (5, 5)).
Seuraavilla kutsukerroilla teksti tulostetaan aina edellisen rivin alle.
Tekstin välitystä voi hallita funktiolla [LineSpacing](manual:linespacing).

Käytettävä väri asetetaan komennolla [TextColor](manual:textcolor).
Käytettävä kirjaisin asetetaan komennolla [TextFont](manual:textfont).
Käytettävä koko asetetaan komennolla [TextSize](manual:textsize).

Example
----------
```eppabasic
Print "Apina"
Print "Banaani"
Print "Cembalo"
```
