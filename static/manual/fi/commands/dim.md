<!--structure-->
Dim
===

```eppabasic
I)      Dim {muuttuja} As {tyyppi}
        Dim {muuttuja} As {tyyppi} = {arvo}
        Dim {muuttuja} = {arvo}
II)     Dim {muuttuja}[{koko}] As {tyyppi}
```

I) Määrittelee muuttujan nimeltä `{muuttuja}` tyyppiä `{tyyppi}`.
Muuttujalle voidaan määrittää myös alkuarvo.
Tällöin tyyppiä ei ole pakko antaa vaan se päätellään `{arvo}`n typistä.
Jos alkuarvoa ei anneta, se on 0 tai "" tyypistä riippuen.

II) Määrittelee taulukon nimeltä `{muuttuja}` tyyppiä `{tyyppi}`.
`{koko}` määrittelee taulukon koon, jollain taulukossa on indeksit 1..`{koko}`.
Taulukolla voi olla myös useampia ulottuvuuksia, jolloin ulottuvuuksien kokojen välissä on pilkku.

Muuttujan nimi voi muodostua kirjaimista, numeroista sekä alaviivoista.
Nimen ensimmäinen merkki ei saa olla numero.

Esimerkki
---------
```eppabasic
Dim nimi As String
nimi = InputText("Anna nimi:")
Dim salasana = "abc"

```
```eppabasic
Dim sade = InputNumber("Anna säde:")
Print "Pinta-ala: " & (ebPi*sade^2)

```
```eppabasic
Dim lista[10] As Number
For i = 1 To 10
    lista[i] = i
Next i

```
```eppabasic
Dim ruudukko[10,10] As Number
ruudukko[3,8] = 15

```
