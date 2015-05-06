<!--structure-->
If
==

```eppabasic
If {condition} Then
    ' Code
End If

If {condition} Then
    ' Code
Else
    ' Code
End If

If {ehto1} Then
    ' Code
Else If {ehto2} Then
    ' Code
End If

If {ehto1} Then
    ' Code
Else If {ehto2} Then
    ' Code
Else
    ' Code
End If
```

Control structure that runs code if `{condition}` is true.
Structure can also contain `Else` branch that is executed if condition is false.

`Else If` structure allows to add multiple conditions to the structure.
In this case, the code corresponding to the first true statement is executed.

Example
---------
```eppabasic
' Ask username from the user and answer differently depending on the answer
Dim nimi = InputText("Input your name:")
If nimi = "Henrik" Then
    Message "Hi Henrik!"
Else If nimi = "Sami" Then
    Message "Nice to meet you Sami!"
Else
    Message "Oh, a new friend"
End If

```
