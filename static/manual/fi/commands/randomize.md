<!--math-->
Randomize
=========

```eppabasic
Sub Randomize(siemen As Integer)
```

Alustaa satunnaislukugeneraattorin annetulla siemenellä.
Samalla siemenellä alustettu satunnaislukugeneraattori tuottaa aina samoja lukuja.
Oletuksena siemenlukuna käytetään kellonaikaan pohjautuvaa arvoa.

Esimerkki
---------
```eppabasic
Randomize 12345
Print Rnd()     ' 0.85374588
Print Rnd()     ' 0.93714768
Print Rnd()     ' 0.66572763
```
