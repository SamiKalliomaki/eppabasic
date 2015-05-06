<!--text-->
Replace
=======

```eppabasic
Function Replace(text As String, needle As String, replacement As String) As String
```

Returns string `text` changed so that all occurences of needle have been replaced with `replacement`.

Example
---------
```eppabasic
Print Replace("aybabtu", "a", "o")      ' oybobtu
Print Replace("aaaaaaaaa", "aaa", "z")  ' zzz
```
