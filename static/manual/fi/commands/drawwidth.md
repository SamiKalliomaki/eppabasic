<!--graphics-->
DrawWidth
==========

```eppabasic
Sub DrawWidth(paksuus As Integer)
```

Määrittä ääriviivakuvioita piirrettäessä käytettäväksi viivan paksuudeksi parametrin `paksuus` arvon.
Paksuus mitataan pikseleissä.

Esimerkki
----------
```eppabasic
' Piirretään eripaksuisia viivoja
DrawWidth 1
DrawLine 50, 50, 200, 50

DrawWidth 2
DrawLine 50, 100, 200, 100

DrawWidth 5
DrawLine 50, 150, 200, 150

DrawWidth 10
DrawLine 50, 200, 200, 200
```
