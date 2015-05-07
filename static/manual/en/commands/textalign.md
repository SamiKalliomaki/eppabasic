<!--graphics-->
TextAlign
=========

```eppabasic
Sub TextAlign(align As String)
```

Defines how the text is aligned when drawing text.
Alignment means the point to which the coordinate
defined when calling [`DrawText`](manual:drawtext)
refers to.

Different meanings for parameter `align`:

Value|Meaning
----|--------
1|Align left
2|Align right
3|Align center

The default is to align left.

Example
----------
```eppabasic
' Draw text "Text!" using different alignments.
TextSize 30
TextAlign 1
DrawText 100, 100, "Text!"
TextAlign 2
DrawText 100, 200, "Text!"
TextAlign 3
DrawText 100, 300, "Text!"
```
