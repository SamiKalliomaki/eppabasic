`Dim`
==========

Komento `Dim` määrittelee muuttujan tai taulukon.

Muuttujan määrittelyyn on kaksi tapaa:

    Dim [nimi] As [tyyppi]
    Dim [nimi] = [arvo]
    
Muuttujan nimessä voi olla kirjaimia a..z sekä numeroita 0..9.
Muuttujan nimen ensimmäinen merkki ei saa olla numero.

Muuttujan tyyppejä ovat `Number` (luku) sekä `String` (merkkijono).

Muuttujan voi määritellä myös antamalla aloitusarvon,
josta päätellään muuttujan tyyppi.
Jos aloitusarvoa ei anneta, oletusarvo on 0 tai "".

Taulukon määrittelytapa on:

    Dim [nimi][[koko]] As [tyyppi]
    
Jos taulukko on moniulotteinen, ulottuvuuksien välissä on pilkku.

Esimerkki 1
----------

    Dim nimi As String
    nimi = InputText("Anna nimi:")
    Dim salasana = "abc"
    
Esimerkki 2
----------

    Dim pii = 3.141592654
    Dim sade = InputNumber("Anna säde:")
    Print "Pinta-ala: " & (pii*sade^2)
    
Esimerkki 3
----------

    Dim lista[10] As Number
    For i = 1 To 10
        lista[i] = i
    Next i
    
Esimerkki 4
----------

    Dim ruudukko[10,10] As Number
    ruudukko[3,8] = 15