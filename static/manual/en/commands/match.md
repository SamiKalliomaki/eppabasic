<!--text-->
Match
=====

```eppabasic
Function Match(teksti As String, sl As Integer) As Boolean
```

Palauttaa tiedon, vastaako merkkijono `teksti` säännölistä lauseketta `sl`.

Lisää tietoa säännöllisistä lausekkeista voi lukea [Ohjelmointiputkan oppaasta](http://www.ohjelmointiputka.net/oppaat/opas.php?tunnus=php_16) (Huomaa! Esimerkit käyttävät PHP-ohjelmointikieltä, mutta samat säännöllisen lausekkeen muodostamisohjeet pätevät myös EppaBasicissa).

Example
---------
```eppabasic
Dim x = InputText("Anna merkkijono, jonka pituus on 6..8 merkkiä:")
If Match(x, "[a-z]{6,8}") Then
    Message "Tervetuloa!"
Else
    Message "Häivy pois!"
End If
```
