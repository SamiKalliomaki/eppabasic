`DrawText`
==========

Komento `DrawText` piirtää tekstiä näytölle.

Komennon parametrit ovat
x- ja y-koordinaatti sekä piirrettävä teksti.

Komennolle voi antaa myös ylimääräisen
parametrin, joka määrittää tekstin asemoinnin:
0 tasaa tekstin vasemmalle (oletus),
1 tasaa tekstin oikealle ja
2 tasaa tekstin keskelle.

Esimerkki 1
----------

    DrawText 100, 120, "aybabtu"
    
Esimerkki 2
----------

    DrawText 100, 120, "aybabtu", 0
    DrawText 100, 140, "aybabtu", 1
    DrawText 100, 260, "aybabtu", 2
