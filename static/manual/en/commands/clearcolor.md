<!--graphics-->
ClearColor
==========

```eppabasic
Sub ClearColor(r As Integer, g As Integer, b As Integer)
```

Määrittää värin, jota käytetään ruudun tyhjentämiseen.
Ruutu tyhjennetään komennolla [ClearScreen](manual:clearscreen).

[Katso, miten värit toimivat EppaBasicissa](manual:../colors).

Example
----------
```eppabasic
' Asetetaan ruudun taustaväriksi punainen ja tyhjennetään se
ClearColor 255, 0, 0
ClearScreen
```
