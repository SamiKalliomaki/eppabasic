`KeyHit`
==========

Funktio `KeyHit` kertoo, onko näppäintä painettu.

Esimerkki
----------

Seuraava koodi tulostaa rivin tekstiä aina,
kun käyttäjä painaa välilyöntiä:

    Do
        If KeyHit(32) Then
            Print "painoit välilyöntiä"
        End If
        DrawScreen
    Loop