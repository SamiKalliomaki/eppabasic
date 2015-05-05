<!--structure-->
Do
==

```eppabasic
Do
    ' Code
Loop

Do While {condition}
    ' Code
Loop

Do Until {condition}
    ' Code
Loop

Do
    ' Code
Loop While {condition}

Do
    ' Code
Loop Until {condition}
```

Repeat structure that allows to repeat code forever or according to a condition.

Word `While` means that the repeation continues
while the `{condition}` is true.
Word `Until` means that the repeation continues
until the `{condition}` becomes true.
.
If the condition of the loop is in the beginning,
condition is checked before every execution of the loop.
If the condition of the loop is in the end,
loop is always executed once before condition is checked.

Example
---------
```eppabasic
' Continue to ask password from user until he enters the correct password "abc"
Dim password As String
Do
    password = InputText("Input the password:")
Loop Until password = "abc"
Message "Welcome!"

```
