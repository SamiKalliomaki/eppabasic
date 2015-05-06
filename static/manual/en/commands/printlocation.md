<!--graphics-->
PrintLocation
=============

```eppabasic
Sub PrintLocation(x As Integer, y As Integer)
```

Sets the location of text for [Print](manual:print) function.
By default (5, 5).


[See how coordinates work in EppaBasic](manual:/coordinates).

Example
----------
```eppabasic
' Change starting position
' Compare to the example of command Print
PrintLocation 100, 10
Print "Alfa"
Print "Bravo"
Print "Cecilia"
```
