<!--structure-->
Sub
====

```eppabasic
Sub {name}({parameters})
    ' Code
End Sub
```

Defines an user defined sub program called `{name}`.

The name of the sub program can contain letters, numbers and underscores.
The first character of the name must not be a number.

`{parameters}` defines parameters that are given to the sub program.
`{parameters}` is a comman-separated list of parameters.
Each parameter is of format
```eppabasic
{name} As {type}
```
```
Compare to [variable definition](manual:dim).

Execution of the sub program can be interrupted by calling
[Return](manual:return) structure in the sub program

Example
---------
```eppabasic
' Sub program draws n circles in a line
Sub DrawCircles(n As Number)
    For i = 1 To n
        FillCircle 50*i, 50, 15
    Next i
End Sub

' Sub programs can be used like this
DrawCircles 5
' Or this
DrawCircles(5)
```
