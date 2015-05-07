<!--math-->
Rnd
===

```eppabasic
I)      Function Rnd() As Number
II)     Function Rnd(min As Integer, max As Integer) As Integer
```

I) Returns a random number in the range [0, 1] inclusive.

II) Returns a random integer in the range [`min`, `max`] inclusive. In other words any number between `min` and `max` is possible return value including ending points.

Example
---------
```eppabasic
' Print "Hi!" on 78% of times and "Hello!" on 22% of times
If Rnd() <= 0.78 Then
    Print "Hi!"
Else
    Print "Hello!"
End If
```
