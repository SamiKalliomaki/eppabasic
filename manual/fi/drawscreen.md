`DrawScreen`
==========

Komento `DrawScreen` päivittää näytön sisällön.

Kun komentoa kutsutaan silmukassa,
se huolehtii siitä,
että silmukan koodi suoritetaan 60 kertaa sekunnissa.

Esimerkki
----------

    For i = 1 To 640
        ClearScreen
        FillCircle i, 200, 50
        DrawScreen
    Next i