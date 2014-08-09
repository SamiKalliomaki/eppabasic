`KeyHit`
==========

Funktio `KeyHit(x)` kertoo, onko näppäintä `x` painettu funktion viime kutsun jälkeen.

[`Lista näppäinkoodeista`](manual:keycodes)

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
    
Katso myös: [`KeyDown`](manual:keydown), [`KeyUp`](manual:keyup)