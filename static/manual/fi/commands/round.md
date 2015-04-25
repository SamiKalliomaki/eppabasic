<!--math-->
Round
====

```eppabasic
I)      Function Round(luku As Number) As Number
II)     Function Round(luku As Number, tarkkuus As Integer) As Number
```

I) Pyöristää luvun `luku` kokonaisluvuksi. Jos desimaaliosa on alle 0.5, funktio pyöristää alaspäin, muuten funktio pyöristää ylöspäin.

II) Funktio pyöristää luvun `luku` tarkkuudelle `tarkkuus`. Jos `tarkkuus` on positiivinen, se tarkoittaa desimaalien määrää pisteen jälkeen. Jos `tarkkuus` on negatiivinen, se tarkoittaa nollien määrää luvun lopussa ennen pistettä.

Esimerkki
---------
```eppabasic
Print Round(4.48)           ' 4
Print Round(4.49)           ' 4
Print Round(4.50)           ' 5
Print Round(4.51)           ' 5
Print Round(4.52)           ' 5

Print Round(ebPi, 1)        ' 3.1
Print Round(ebPi, 2)        ' 3.14
Print Round(ebPi, 3)        ' 3.142
Print Round(ebPi, 4)        ' 3.1416
Print Round(ebPi, 5)        ' 3.14159

Print Round(12345, -1)      ' 12340
Print Round(12345, -2)      ' 12300
Print Round(12345, -3)      ' 12000
Print Round(12345, -4)      ' 10000
Print Round(12345, -5)      ' 0
```
