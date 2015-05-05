<!--graphics-->
ClearColor
==========

```eppabasic
Sub ClearColor(r As Integer, g As Integer, b As Integer)
```

Defines the color that is used for clearing the screen.
Screen can be cleared using command [ClearScreen](manual:clearscreen).

[See how colors work in EppaBasic.](manual:../colors).

Example
----------
```eppabasic
' Set the clearing color of the screen as red and clear it.
ClearColor 255, 0, 0
ClearScreen
```
