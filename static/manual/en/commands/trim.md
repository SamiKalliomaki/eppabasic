<!--text-->
Trim
====

```eppabasic
Function Trim(teksti As String) As String
```

Palauttaa merkkijonon `teksti` siten, että alusta jo lopusta on poistettu kaikki näkymättömät merkit (välilyönnit, rivinvaihdot yms.).

Example
---------
```eppabasic
Print "*" & Trim("    aybabtu       ") & "*"  ' *aybabtu*
```
