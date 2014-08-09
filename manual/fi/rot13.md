`Rot13`
==========

Funktio `Rot13(s)` muodostaa merkkijonon `s` rot13-muunnoksen.

Muunnoksessa merkit `a`..`z` ja `A`..`Z` muuttuvat seuraavan taulukon mukaisesti:

    abcdefghijklmnopqrstuwvxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ
    nopqrstuvwxyzabcdefghijklm NOPQRSTUVWXYZABCDEFGHIJKLM
    
Toisin sanoen merkit liikkuvat 13 askelta eteenpäin aakkosissa
(tarvittaessa pyörähtäen ympäri).
Jos muunnoksen tekee kahdesti, tuloksena on alkuperäinen merkkijono.
    
Rot13-muunnosta voi käyttää yksinkertaisena salausmenetelmänä.

Esimerkki 1
----------

    Print Rot13("aybabtu")
    
Koodin tulostus:

    nlonogh
    
Esimerkki 2
----------

    Print Rot13(Rot13("aybabtu"))
    
Koodin tulostus:

    aybabtu