<!--math-->
Abs
===

```eppabasic
Function Abs(number As Number) As Number
Function Abs(number As Integer) As Integer
```

Returns the absolute value of the parameter `number` which means the distance of
the number from zero. In other words, returns the number without the leading sign.

Example
---------
```eppabasic
Print Abs(10)     ' 10
Print Abs(-10)    ' 10
Print Abs(-3.14)  ' 3.14
```
