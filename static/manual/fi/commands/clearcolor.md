`ClearColor`
==========

Komento `ClearColor` määrittää värin, jolla näyttö tyhjennetään.

Komentoa käytetään näin:

    ClearColor r, g, b
    
Parametrit ovat:

* `r`: punaisen värin määrä (0–255)
* `g`: vihreän värin määrä (0–255)
* `b`: sinisen värin määrä (0–255)

Esimerkki
----------

Seuraava koodi muuttaa tyhjennysväriksi punaisen ja tyhjentää sitten näytön:

    ClearColor 255, 0, 0
    ClearScreen