<!--structure-->
If
==

```eppabasic
If {ehto} Then
    ' Koodia
End If

If {ehto} Then
    ' Koodia
Else
    ' Koodia
End If

If {ehto1} Then
    ' Koodia
Else If {ehto2} Then
    ' Koodia
End If

If {ehto1} Then
    ' Koodia
Else If {ehto2} Then
    ' Koodia
Else
    ' Koodia
End If
```

Ehtorakenne, joka suorittaa koodin, mikäli `{ehto}` on tosi.
Ehtoon voidaan liittää myös `Else`-haara, joka suoritetaan, mikäli ehto on epätosi.

`Else If`-rakenteen avulla voidaan lisätä ehtorakenteeseen useampia ehtoja.
Tällöin suoritetaan ensimmäistä toteutuvaa ehtoa vastaava koodi.

Example
---------
```eppabasic
' Kysytään käyttäjältä käyttäjänimeä ja vastataan eri tavalla eri henkilöille
Dim nimi = InputText("Anna nimesi:")
If nimi = "Henrik" Then
    Message "Hei Henrik!"
Else If nimi = "Sami" Then
    Message "Hauska tavata Sami!"
Else
    Message "Oi, uusi tuttavuus"
End If

```
