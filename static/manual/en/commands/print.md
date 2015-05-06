<!--graphics-->
Print
=====

```eppabasic
Sub Print(text As String)
```

Draws text `text` on screen.

On first call function prints to the location defined using function [PrintLocation](manual:printlocation) (by default (5, 5)).
On subsequent calls text is printed below previous line.
Text spacing can be controlled using function [LineSpacing](manual:linespacing).

The color to be used can be set using the command [TextColor](manual:textcolor).
The font to be used can be set using the command [TextFont](manual:textfont).
The size of the text can be set using the command [TextSize](manual:textsize).

Example
----------
```eppabasic
Print "Alfa"
Print "Bravo"
Print "Cecilia"
```
