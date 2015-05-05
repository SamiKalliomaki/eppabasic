<!--text-->
Mid
===

```eppabasic
Function Mid(teksti As String, alku As Integer) As String
Function Mid(teksti As String, alku As Integer, pituus As Integer) As String
```

Erottaa osan merkkijonon keskeltä

Palauttaa merkkijonon `teksti` merkkejä kohdasta `alku` eteenpäin.
Jos `pituus` on määritelty, palauttaa korkeintaan `pituus` merkkiä, muuten kaikki merkit merkkijonon  `teksti` loppuun asti.

Example
---------
```eppabasic
Print Mid("aybabtu", 4)     ' abtu
Print Mid("aybabtu", 2, 3)  ' yba
```
