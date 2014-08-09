`InputCancel`
==========

Funktio `InputCancel()` kertoo,
painoiko käyttäjä Peruuta-nappia
äskeisessä kysymysikkunassa.

Esimerkki
----------

    Dim x = InputText("Anna nimesi:")
    If InputCancel() Then
        Message "Ei sitten!"
    Else
        Message "Kiitos!"
    End If
    
Katso myös: [`InputNumber`](manual:inputnumber), [`InputText`](manual:inputtext)