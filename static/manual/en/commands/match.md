<!--text-->
Match
=====

```eppabasic
Function Match(text As String, regex As String) As Boolean
```

Returns whether string `text` matches regular expression `regex`.

More information about regular expressions can be found for example here: http://regexone.com/

Example
---------
```eppabasic
Dim x = InputText("Input a string that consists of 6 to 8 lower case characters:")
If Match(x, "[a-z]{6,8}") Then
    Message "Welcome!"
Else
    Message "Go away!"
End If
```
