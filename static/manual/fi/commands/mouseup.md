`MouseUp`
==========

Funktio `MouseUp(x)` palauttaa tiedon, onko hiiren nappi `x` ylhäällä.

Vasemman napin tunnus on 1, oikean napin 2 ja keskinapin 3.

Esimerkki
----------

    Do
        ClearScreen
        If MouseUp(1) Then
            Print "vasen nappi ylhäällä"
        End If
        If MouseUp(2) Then
            Print "oikea nappi ylhäällä"
        End If
        If MouseUp(3) Then
            Print "keskinappi ylhäällä"
        End If
        DrawScreen
    Loop
    
Katso myös: [`MouseDown`](manual:mousedown), [`MouseHit`](manual:mousehit)