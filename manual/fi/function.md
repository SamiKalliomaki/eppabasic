`Function`
==========

Komento `Function` määrittelee oman funktion.

Funktion määrittelyn runko on seuraava:

    Function [nimi]([parametrit]) As [tyyppi]
        [koodi]
    End Function
    
Funktion nimi muodostuu kirjaimista a..z ja numeroista 0..9.
Nimen ensimmäinen merkki ei saa olla numero.

Parametrit ovat funktiolle annettavat parametrit.
Jokaisesta parametrista täytyy ilmoittaa nimi ja tyyppi.

Funktion tyyppi on sen palautusarvon tyyppi.

Funktion sisällä oleva komento `Return` palauttaa
arvon ja lopettaa funktion.

Esimerkki
----------

Seuraava funktio laskee lukujen 1,2,3,..,`n` summan:

    Function Summa(n As Number) As Number
        Dim s = 0
        For i = 1 To n
            s = s + i
        Next i
        Return s
    End Function
    
Funktiota voi käyttää näin:

    Print Summa(9)
    
Koodin tulostus on seuraava:

    45