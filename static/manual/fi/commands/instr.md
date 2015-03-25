<!--text-->
InStr
===

```eppabasic
Function InStr(heinäsuova As String, neula As String) As Integer
Function InStr(alku As Integer, heinäsuova As String, neula As String) As Integer
```

Palauttaa ensimmäisen kohdan, jossa merkkijono `neula` esiintyy merkkijonossa `heinäsuova`.
Jos `alku` on määritelty, etsitään ensimmäistä esiintyvää kohdasta `alku` alkaen, muuten merkkijonon alusta.

Jos merkkijono `neula` ei esiinny merkkijonossa `heinäsuova`, funktio palauttaa 0.

Esimerkki
---------
```eppabasic
Print InStr("aybabtu", "bab")       ' 3
Print InStr("aybabtu", "lol")       ' 0
Print InStr("aybabtu", "b")         ' 3
Print InStr(4, "aybabtu", "b")      ' 5
Print InStr(7, "aybabtu", "b")      ' 0
```
