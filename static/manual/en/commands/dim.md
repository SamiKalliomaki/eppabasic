<!--structure-->
Dim
===

```eppabasic
I)      Dim {variable} As {type}
        Dim {variable} As {type} = {value}
        Dim {variable} = {value}
II)     Dim {variable} As {type}[{size}]
```

I) Defines a variable called `{variable}` of type `{type}`.
Variable can also be given an initial value.
In this case, the type doesn't have to be specified and it's instead derived
from the type of the `{value}`. If an initial value is not specified, it is
0 or "" depending on the type.

II) Määrittelee taulukon nimeltä `{variable}` tyyppiä `{type}`.
`{size}` määrittelee taulukon koon, jollain taulukossa on indeksit 1..`{size}`.
Taulukolla voi olla myös useampia ulottuvuuksia, jolloin ulottuvuuksien kokojen välissä on pilkku.

II) Defines an array called `{variable}` of type `{type}`.
`{size}` defines the size of the array, which means array contains indexes 1..`{size}`.
Array can also have multiple dimensions in which case there should be a comma
between the dimensions.

The name of the variable can consist of letters, numbers and underscores. The
first character of the name must not be a number.

Example
---------
```eppabasic
Dim name As String
name = InputText("Give a name:")
Dim salasana = "abc"

```
```eppabasic
Dim radius = InputNumber("Give a radius:")
Print "Area: " & (ebPi*radius^2)

```
```eppabasic
Dim list As Number[10]
For i = 1 To 10
    list[i] = i
Next i

```
```eppabasic
Dim grid As Number[10,10]
grid[3,8] = 15

```
