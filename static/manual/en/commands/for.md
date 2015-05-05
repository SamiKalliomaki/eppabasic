<!--structure-->
For
===

```eppabasic
For {muuttuja} = {alku} To {loppu}
Next {muuttuja}

For {muuttuja} = {alku} To {loppu} Step {askel}
Next {muuttuja}
```

Toistorakenne, jonka avulla voi käydä läpi luvut tietyllä välillä.

`For`-silmukka käy läpi luvut väliltä `{alku}`..`{loppu}`.
Silmukan peräkkäisillä kierroksilla `muuttuja` kasvaa aina `{askel}` verran.
Jos `{askel}` ei ole määritelty, käytetään askeleen kokona lukua 1.

Example
---------
```eppabasic
' Tulostaa luvut 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
For i = 1 To 10
    Print i
Next i
```
```eppabasic
' Tulostaa luvut 10, 20, 30, 40 ja 50
For i = 10 To 50 Step 10
    Print i
Next i
```
