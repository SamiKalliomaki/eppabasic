<!--graphics-->
DrawScreen
==========

```eppabasic
Sub DrawScreen()
```

Päivittää edellisen kutsun jälkeen piirretyt asiat näytölle.

Kun komentoa kutsutaan silmukassa,
se huolehtii siitä,
että silmukan koodi suoritetaan 60 kertaa sekunnissa.

Esimerkki
----------
```eppabasic
' Lyhyt animaatio, jossa ympyrä kulkee ruudun halki
For i = 1 To 640
    ClearScreen
    FillCircle i, 200, 50
    DrawScreen
Next i
```
