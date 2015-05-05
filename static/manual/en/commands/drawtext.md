<!--graphics-->
DrawText
========

```eppabasic
Sub DrawText(x As Integer, y As Integer, text As String)
Sub DrawText(x As Integer, y As Integer, text As String, align As Integer)
```

Draws text `text` at coordinates (`x`, `y`).
The color to be used can be set using the command [TextColor](manual:textcolor).
The font to be used can be set using the command [TextFont](manual:textfont).
The size of the text can be set using the command [TextSize](manual:textsize).

If parameter `align` is not given, the align set using
[TextAlign](manual:textalign) is used.

See [TextAlign](manual:textalign) to get more information about aligning the text.

<!--- TODO Write this
[Katso, miten EppaBasicissa koordinaatisto toimii](manual:/coordinates).
-->


Example
----------
```eppabasic
' Draw text "Programming is fun!" at coordinates (10, 20)
DrawText 10, 20, "Programming is fun!"
```
