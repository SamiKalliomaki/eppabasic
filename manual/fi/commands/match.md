`Match`
==========

Funktio `Match(s, r)` tutkii, vastaako merkkijono `s`
säännöllistä lauseketta `r`.

Esimerkki
----------

Seuraava koodi hyväksyy tunnussanat,
jotka muodostuvat merkeistä a..z ja
joiden pituus on 6..8 merkkiä.

    Dim x = InputText("Anna tunnussana:")
    If Match(x, "[a-z]{6,8}") Then
        Message "Tervetuloa!"
    Else
        Message "Häivy pois!"
    End If
    