<!--window-->
WindowTitle
============

```eppabasic
Sub WindowTitile(otsikko As String)
Function WindowTitile() As String
```

Asettaa ikkunan otsikoksi `otsikko` tai palauttaa ikkunan otsikon.


Example
----------
```eppabasic
' Asetetaan ikkunan otsikko
WindowTitle "Exampleohjelma"

Do
    ' Päivitetään piirtoalueen koko vastaamaan ikkunan kokoa
    CanvasWidth WindowWidth()
    CanvasHeight WindowHeight()

    ' Piirretään viiva vasemmasta yläkulmasta oikean laidan keskelle
    ClearScreen
    DrawLine 0, 0, CanvasWidth(), CanvasHeight() / 2
    DrawScreen
Loop
```
