`MouseDown`
==========

Funktio `MouseDown(x)` palauttaa tiedon, onko hiiren nappi `x` alhaalla.

Vasemman napin tunnus on 1, oikean napin 2 ja keskinapin 3.

Esimerkki
----------

    Do
        ClearScreen
        If MouseDown(1) Then
            Print "vasen nappi alhaalla"
        End If
        If MouseDown(2) Then
            Print "oikea nappi alhaalla"
        End If
        If MouseDown(3) Then
            Print "keskinappi alhaalla"
        End If
        DrawScreen
    Loop
    
Katso myös: [`MouseHit`](manual:mousehit), [`MouseUp`](manual:mouseup)