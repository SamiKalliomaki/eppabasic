<!--graphics-->
LineSpacing
=============

```eppabasic
Sub LineSpacing(väli As Number)
```

Asettaa [Print](manual:print)-funktion luomien rivien välin.
Parametri `väli` kertoo, millä luvulla kirjaisimen koko on kerrottava seuraavan rivin sijaintia laskettaessa.
Oletuksena 1.2.

[See how coordinates work in EppaBasic](manual:/coordinates).

Example
----------
```eppabasic
' Siirretään tulostuskohtaa
' Vertaa Print-komennon Examplein
LineSpacing 1.8
Print "Apina"
Print "Banaani"
Print "Cembalo"
```
