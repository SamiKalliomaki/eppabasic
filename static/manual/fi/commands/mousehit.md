`MouseHit`
==========

Funktio `MouseHit(x)` kertoo, onko hiiren nappia `x` painettu funktion viime kutsun jälkeen.

Vasemman napin tunnus on 1, oikean napin 2 ja keskinapin 3.

Esimerkki
----------

Seuraava koodi tulostaa rivin tekstiä aina,
kun käyttäjä painaa hiiren vasenta nappia:

    Do
        If MouseHit(1) Then
            Print "painoit nappia"
        End If
        DrawScreen
    Loop
    
Katso myös: [`MouseDown`](manual:mousedown), [`MouseUp`](manual:mouseup)