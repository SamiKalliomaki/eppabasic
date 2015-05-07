<!--text-->
Rot13
=======

```eppabasic
Function Rot13(text As String) As String
```

Returns rot13 transformation of `text`.

The transformation transforms letters `a..z` and `A..Z` according to the following table:
```
abcdefghijklmnopqrstuwvxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ
nopqrstuvwxyzabcdefghijklm NOPQRSTUVWXYZABCDEFGHIJKLM
```
In other words letters transfer 13 steps forward in alphabets rotating back to start if necessary.
Executing the transformation twice returns the original string.

Rot13 can be used as a simple encryption
though nothing sensitive should be encrypted using it.

Example
---------
```eppabasic
Print Rot13("aybabtu")              ' nlonogh
Print Rot13(Rot13("aybabtu"))       ' aybabtu
```
