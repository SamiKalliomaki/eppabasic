<!--text-->
Mid
===

```eppabasic
Function Mid(text As String, offset As Integer) As String
Function Mid(text As String, offset As Integer, length As Integer) As String
```

Takes a string from middle of another

Returns characters from string `text` starting at `offset`.
If `length` is defined, at most `length` characters are returned. Otherwise, all
characters until the end of string `text` are returned.
Example
---------
```eppabasic
Print Mid("aybabtu", 4)     ' abtu
Print Mid("aybabtu", 2, 3)  ' yba
```
