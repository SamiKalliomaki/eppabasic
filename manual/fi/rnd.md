`Rnd`
==========

Funktio `Rnd` arpoo satunnaisen luvun.
Funktiota voi käyttää kahdella tavalla:

* `Rnd(a, b)` arpoo satunnaisen kokonaisluvun väliltä `a`..`b`.
* `Rnd()` arpoo satunnaisen desimaaliluvun väliltä 0..1.

Esimerkki 1
----------

Seuraava koodi simuloi nopan heittämistä 10 kertaa:

    For i = 1 To 10
        Print Rnd(1, 6)
    Next i
    
Koodin tulostus (esimerkiksi):

    5
    6
    4
    4
    4
    2
    1
    2
    4
    3
    
Esimerkki 2
----------

Seuraava koodi tulostaa 78 % todennäköisyydellä "Moikka!" ja 22 % todennäköisyydellä "Heippa!"

    If Rnd() <= 0.78 Then
        Print "Moikka!"
    Else
        Print "Heippa!"
    End If