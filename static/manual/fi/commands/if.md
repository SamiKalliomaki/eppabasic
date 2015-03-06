`If`
==========

Komento `If` määrittelee ehtorakenteen.

Yksinkertaisin ehtorakenne on:

    If [ehto] Then
        [koodi]
    End If
    
Tässä koodi suoritetaan, jos ehto pitää paikkansa.

Rakenteeseen voi liittää `Else`-haaran:

    If [ehto] Then
        [koodi]
    Else
        [koodi]
    End If
    
Nyt suoritetaan jompikumpi koodi sen mukaan, pitääkö ehto paikkansa.

Rakenteeseen voi liittää myös useita ehtoja:

    If [ehto1] Then
        [koodi]
    ElseIf [ehto2] Then
        [koodi]
    ElseIf [ehto3] Then
        [koodi]
    End If
    
Nyt suoritetaan ensimmäistä toteutuvaa ehtoa vastaava koodi.
    
Esimerkki
----------

    Dim salasana = InputText("Anna salasana:")
    If salasana = "abc" Then
        Message "Tervetuloa!"
    Else
        Message "Häivy pois!"
    End If