`KeyDown`
==========

Funktio `KeyDown(x)` palauttaa tiedon, onko näppäin `x` alhaalla. 

[`Lista näppäinkoodeista`](manual:keycodes)

Esimerkki
----------

    Do
        ClearScreen
        If KeyDown(32) Then
            Print "painat välilyöntiä"
        End If
        DrawScreen
    Loop
    
Katso myös: [`KeyHit`](manual:keyhit), [`KeyUp`](manual:keyup)