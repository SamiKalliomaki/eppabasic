<!--math-->
Round
====

```eppabasic
I)      Function Round(value As Number) As Number
II)     Function Round(value As Number, accuracy As Integer) As Number
```

I) Rounds `value` to nearest integer. If the decimal part is less than 0.5, the rounding is done to lower integer, otherwice to higher.

II) Rounds `value` to a specific accuracy. If `accuracy` is positive it defines the number of numbers after decimal point. If `accuracy` is nagetive it defines the number of zeros after integral part before decimal point.

Example
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
