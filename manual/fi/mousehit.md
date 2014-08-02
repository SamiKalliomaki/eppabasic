`MouseHit`
==========

Funktio `MouseHit` kertoo, onko hiiren nappia painettu.

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