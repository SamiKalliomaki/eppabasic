<!--graphics-->
TextColor
==========

```eppabasic
Sub TextColor(r As Integer, g As Integer, b As Integer)
```

Defines the color that is used for drawing text.

[See how colors work in EppaBasic.](manual:../colors).

Example
----------
```eppabasic
' Draw a green "Programming is fun!"
TextColor 0, 255, 0
DrawText 10, 20, "Programming is fun!"
```
