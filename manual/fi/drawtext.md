`DrawText`
==========

Komento `DrawText` piirtää tekstiä näytölle.

Komentoa käytetään näin:

    DrawText x, y, s
    
Parametrit ovat:

* `x`: tekstin x-koordinaatti (ks. [`TextAlign`](manual:textalign))
* `y`: tekstin yläreunan y-koordinaatti
* `s`: piirrettävä teksti

Esimerkki
----------

Seuraava koodi piirtää näytölle tekstin "aybabtu":

    DrawText 100, 120, "aybabtu"