<!--messages-->
InputText
=========

```eppabasic
Function InputText(message as String) As String
```

Shows user the message `message` and asks him to input text. Returns
the text written by the user.

Example
----------
```eppabasic
Dim text = InputText("Input text:")
Message "Text reversed: " & Reverse(text)
```
