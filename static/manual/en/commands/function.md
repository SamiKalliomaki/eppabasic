<!--structure-->
Function
========

```eppabasic
Function {name}({parameters}) As {return type}
    ' Code
End Function
```

Defines an user defined function called `{name}`.

The name of the function can contain letters, numbers and underscores.
The first character of the name must not be a number.

`{parameters}` defines parameters that are given to the function.
`{parameters}` is a comman-separated list of parameters.
Each parameter is of format
```eppabasic
{name} As {type}
```
Compare to [variable definition](manual:dim).

`{return type}` defines the type of the return value of the function.
Function must return a value using [Return](manual:return) structure.

Esimerkki
---------
```eppabasic
' Function calculates the sum 1+2+3+...+n
Function Sum(n As Number) As Number
    Dim s = 0
    For i = 1 To n
        s = s + i
    Next i
    Return s
End Function

' Function can be used this way
Print Sum(10)         ' 55
```
