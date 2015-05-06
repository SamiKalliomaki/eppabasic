<!--structure-->
For
===

```eppabasic
For {variable} = {first} To {last}
Next {variable}

For {variable} = {first} To {last} Step {step}
Next {variable}
```

Loop that allows to go through numbers on a certain interval.

`For` loop goes through all the numbers in interval `{first}`..`{last}`.
On repeated executions of the loop `variable` grows by `step`.
If `{step}` is not defined, step value of 1 is used.

Example
---------
```eppabasic
' Prints numbers 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
For i = 1 To 10
    Print i
Next i
```
```eppabasic
' Prints numbers 10, 20, 30, 40 and 50
For i = 10 To 50 Step 10
    Print i
Next i
```
