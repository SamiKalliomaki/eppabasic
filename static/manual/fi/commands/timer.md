<!--time-->
Timer
=====

```eppabasic
Function Timer() As Integer
```

Palauttaa nykyisen hetken unix-aikaleiman.
Unix-aikaleima tarkoittaa sekuntien määrää hetkestä 1.1.1970 0:00:00.
Vuosien varrella kertyneet karkaussekuntit kuitenkin häiritsevät tätä laskua.

Hyödyllinen ohjelman suoritusajan tarkkailemiseen.

Esimerkki
---------
```eppabasic
' Mitataan, kauanko käyttäjällä kuluu painaa välilyöntiä
Print "Paina välilyöntiä"
Dim alku = Timer()
Do Until KeyHit(ebKeySpace)
    DrawScreen
Loop
Print Timer() - alku
```
