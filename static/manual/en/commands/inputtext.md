<!--messages-->
InputText
=========

```eppabasic
Function InputText(viesti as String) As String
```

Näyttää käyttäjälle viestin `viesti` ja pyytää häntä syöttämään tekstiä.
Palauttaa käyttäjän kirjoittaman tekstin.

Example
----------
```eppabasic
Dim teksti = InputText("Anna tekstiä:")
Message "Teksti takaperin: " & Reverse(teksti)
```
