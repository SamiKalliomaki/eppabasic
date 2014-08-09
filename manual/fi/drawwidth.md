`DrawWidth`
==========

Komento `DrawWidth` määrittää kuvioiden ääriviivojen paksuuden.

Komentoa käytetään näin:

    DrawWidth x
    
Parametri `x` on ääriviivan paksuus.

Esimerkki
----------

Seuraava koodi piirtää neljä viivaa, joiden paksuudet ovat 1, 2, 5 ja 10.

    DrawWidth 1
    DrawLine 50, 50, 200, 50
    DrawWidth 2
    DrawLine 50, 100, 200, 100
    DrawWidth 5
    DrawLine 50, 150, 200, 150
    DrawWidth 10
    DrawLine 50, 200, 200, 200