<!--messages-->
InputNumber
===========

```eppabasic
Function InputNumber(message as String) As Number
```

Shows user the message `message` and asks him to input a number.
If user doesn't write a number, program asks user again.
Returns the number written by the user.

Example
----------
```eppabasic
Dim number = InputNumber("Input a number:")
Message "The square root of the number is " & Sqrt(number)
```
