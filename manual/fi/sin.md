`Sin`
==========

Funktio `Sin` palauttaa kulman sinin. Kulman suuruus annetaan radiaaneina.

Esimerkki
----------

Seuraava koodi piirtää pisteistä ympyrän, jossa on 20 pistettä:

    Dim pii = 3.141592654
    For i = 0.0 To 2*pii Step 2*pii/20
        DrawDot 320+Cos(i)*100, 240+Sin(i)*100
    Next i
