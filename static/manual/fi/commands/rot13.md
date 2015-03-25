<!--text-->
Rot13
=======

```eppabasic
Function Rot13(teksti As String) As String
```

Palauttaa merkkijonon `teksti` rot13-muunnoksen.

Muunnoksessa merkit `a..z` ja `A..Z` muuttuvat seuraavan taulukon mukaisesti:
```
abcdefghijklmnopqrstuwvxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ
nopqrstuvwxyzabcdefghijklm NOPQRSTUVWXYZABCDEFGHIJKLM
```
Toisin sanoen merkit liikkuvat 13 askelta eteenpäin aakkosissa tarvittaessa pyörähtäen ympäri.
Jos muunnoksen tekee kahdesti, tuloksena on alkuperäinen merkkijono.

Rot13-muunnosta voi käyttää yksinkertaisena salausmenetelmänä,
tosin sen avulla ei kannata salata mitään arvokasta.

Esimerkki
---------
```eppabasic
Print Rot13("aybabtu")              ' nlonogh
Print Rot13(Rot13("aybabtu"))       ' aybabtu
```
