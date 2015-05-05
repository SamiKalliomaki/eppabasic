<!--structure-->
Do
==

```eppabasic
Do
    ' Koodia
Loop

Do While {ehto}
    ' Koodia
Loop

Do Until {ehto}
    ' Koodia
Loop

Do
    ' Koodia
Loop While {ehto}

Do
    ' Koodia
Loop Until {ehto}
```

Toistorakenne, jonka avulla voidaan toistaa koodia joko ikuisesti tai ehdon mukaan.

Merkintä `While` tarkoittaa, että silmukka jatkuu
niin kauan kuin `{ehto}` pitää paikkansa.
Merkintä `Until` tarkoittaa, että silmukka jatkuu
siihen asti kunnes `{ehto}` muuttuu todeksi.

Jos silmukan ehto on alussa,
ehto tarkastetaan ennen silmukan suoritusta.
Jos taas ehto on lopussa,
suoritetaan silmukka aluksi kerran ennen kuin ehto tarkistetaan.

Example
---------
```eppabasic
' Tulostaa luvut 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
For i = 1 To 10
    Print i
Next i
```
```eppabasic
' Kysytään käyttäjältä salasanaa toistuvasti, kunnes hän syöttää oikean salasanan "abc"
Dim salasana As String
Do
    salasana = InputText("Anna salasana:")
Loop Until salasana = "abc"
Message "Tervetuloa!"

```
