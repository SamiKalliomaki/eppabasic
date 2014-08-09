`Randomize`
==========

Komento `Randomize` alustaa satunnaislukugeneraattorin.

Komentoa käytetään näin:

    Randomize x
    
Parametri `x` on siemenluku, jonka perusteella satunnaislukugeneraattori alkaa arpoa lukuja. Samalla siemenluvulla tulee aina sama sarja satunnaislukuja.

Jos komentoa `Randomize` ei käytetä, siemenluku määräytyy koodin käynnistyshetkestä.

Esimerkki
----------

    Randomize 12345
    Print Rnd()
    Print Rnd()
    Print Rnd()
    
Koodin tulostus (aina):

    0.85374588
    0.93714768
    0.66572763
    
Katso myös: [`Rnd`](manual:rnd)