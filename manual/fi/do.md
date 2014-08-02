`Do`
==========

Komento `Do` määrittelee silmukan. Tapoja on neljä:

    Do While [ehto]
    Loop

    Do Until [ehto]
    Loop

    Do
    Loop While [ehto]

    Do
    Loop Until [ehto]
    
Merkintä `While` tarkoittaa, että silmukka jatkuu
niin kauan kuin ehto pitää paikkansa.
Merkintä `Until` tarkoittaa, että silmukka jatkuu
siihen asti kunnes ehto muuttuu todeksi.

Jos silmukan ehto on alussa,
ehto tarkastetaan ennen silmukan suoritusta.
Jos taas ehto on lopussa,
ehto tarkastetaan silmukan suorituksen jälkeen.
    
Esimerkki
----------

Seuraava koodi kysyy salasanaa, kunnes käyttäjä
antaa oikean salasanan "abc".

    Dim salasana As String
    Do
        salasana = InputText("Anna salasana:")
    Loop Until salasana = "abc"
    Message "Tervetuloa!"