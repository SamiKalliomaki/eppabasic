`Match`
==========

Funktio `Match` tutkii, vastaako merkkijono annettua
säännöllistä lauseketta.

Esimerkki
----------

Seuraava koodi hyväksyy tunnussanat,
jotka muodostuvat merkeistä a..z ja
joiden pituus on 6..8 merkkiä.

    Dim mjono = AskText("Anna tunnussana:")
    If Match(mjono, "[a-z]{6,8}") Then
        Message "Tervetuloa!"
    Else
        Message "Häivy pois!"
    End If
    