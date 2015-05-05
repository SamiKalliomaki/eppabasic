<!--text-->
Replace
=======

```eppabasic
Function Replace(teksti As String, korvattava As String, korvaava As String) As String
```

Palauttaa merkkijonon `teksti` muutettuna siten, että kaikki kohdat, joissa esiintyy merkkijono `korvattava` on korvattu merkkijonolla `korvaava`.

Example
---------
```eppabasic
Print Replace("aybabtu", "a", "ö")      ' öyböbtu
Print Replace("aaaaaaaaa", "aaa", "z")  ' zzz
```
