`DrawColor`
==========

Komento `DrawColor` määrittää värin, jolla kuvioiden ääriviivat piirretään.

Komentoa käytetään näin:

    DrawColor r, g, b
    
Parametrit ovat:

* `r`: punaisen värin määrä (0–255)
* `g`: vihreän värin määrä (0–255)
* `b`: sinisen värin määrä (0–255)

Esimerkki
----------

Seuraava koodi piirtää sinisen ympyrän:

    DrawColor 0, 0, 255
    DrawCircle 200, 200, 50