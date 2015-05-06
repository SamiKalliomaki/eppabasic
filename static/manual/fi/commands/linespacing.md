<!--graphics-->
LineSpacing
=============

```eppabasic
Sub LineSpacing(väli As Number)
```

Asettaa [Print](manual:print)-funktion luomien rivien välin.
Parametri `väli` kertoo, millä luvulla kirjaisimen koko on kerrottava seuraavan rivin sijaintia laskettaessa.
Oletuksena 1.2.

[Katso, miten koordinaatisto toimii EppaBasicissa](manual:/coordinates).

Esimerkki
----------
```eppabasic
' Siirretään tulostuskohtaa
' Vertaa Print-komennon esimerkkiin
LineSpacing 1.8
Print "Apina"
Print "Banaani"
Print "Cembalo"
```
