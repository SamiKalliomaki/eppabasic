`Sub`
==========

Komento `Sub` määrittelee oman aliohjelman.

Aliohjelman määrittelyn runko on seuraava:

    Sub [nimi]([parametrit])
        [koodi]
    End Sub
    
Aliohjelman nimi muodostuu kirjaimista a..z ja numeroista 0..9.
Nimen ensimmäinen merkki ei saa olla numero.

Parametrit ovat aliohjelmalle annettavat parametrit.
Jokaisesta parametrista täytyy ilmoittaa nimi ja tyyppi.

Aliohjelman sisällä oleva komento `Return`
lopettaa aliohjelman.

Esimerkki
----------

Seuraava aliohjelma piirtää annetun määrän ympyröitä riviin:

    Sub PiirraYmpyrat(n As Number)
        For i = 1 To n
            FillCircle 50*i, 50, 15
        Next i
    End Sub
    
Funktiota voi käyttää näin:

    PiirraYmpyrat 5
