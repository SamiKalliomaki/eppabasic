<!--text-->
Trim
====

```eppabasic
Function Trim(text As String) As String
```

Retursn the string `text` with all invisible characters (spaces, line feeds etc.) removed from the begining and end of the original string.

Example
---------
```eppabasic
Print "*" & Trim("    aybabtu       ") & "*"  ' *aybabtu*
```
