<!--text-->
InStr
===

```eppabasic
Function InStr(haystack As String, needle As String) As Integer
Function InStr(offset As Integer, haystack As String, needle As String) As Integer
```

Returns the position of first occurence of `needle` in string `haystack`.
If `offset` is given, the search is started from the position `offset`, otherwise from the start of the string.

If string `needle` doesn't occur in the string `haystack`, function returns 0.

Example
---------
```eppabasic
Print InStr("aybabtu", "bab")       ' 3
Print InStr("aybabtu", "lol")       ' 0
Print InStr("aybabtu", "b")         ' 3
Print InStr(4, "aybabtu", "b")      ' 5
Print InStr(7, "aybabtu", "b")      ' 0
```
