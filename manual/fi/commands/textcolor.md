`TextColor`
==========

Komento `TextColor` määrittää värin, jolla teksti piirretään.

Komentoa käytetään näin:

    TextColor r, g, b
    
Parametrit ovat:

* `r`: punaisen värin määrä (0–255)
* `g`: vihreän värin määrä (0–255)
* `b`: sinisen värin määrä (0–255)

Esimerkki
----------

Seuraava koodi kirjoittaa vihreällä tekstin "EppaBasic":

    TextColor 0, 255, 0
    DrawText 50, 50, "EppaBasic"