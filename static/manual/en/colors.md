Defining the colors
===================

EppaBasicissa värien määrittämiseen käytetään mallia,
jossa väri koostuu kolmesta värikomponentista:
punaisesta (r), vihreästä (g) ja sinisestä(b).
In EppaBasic, colors are encoded using three numbers:
red (r), green(g) and blue(b).
All the colors that computer monitor can produce can be declared using
this system. Each components value is between 0 and 255.

EppaBasicissa on neljä funktiota,
joilla voidaan muuttaa eri piirtokomentojen käyttämiä värejä.
EppaBasic has four functions that can be used to change the drawing color
of different drawing functions.

Function|Color used for
--------|--------------
[ClearColor](manual:/commands/clearcolor)|Clearing the screen
[DrawColor](manual:/commands/clearcolor)|Drawing lines and outlines of shapes
[FillColor](manual:/commands/clearcolor)|Drawing filled shapes
[TextColor](manual:/commands/clearcolor)|Drawing text


Examples of colors
--------------------
Color|Red component|Green component|Blue component
-----|-------------|---------------|--------------
Musta|0|0|0
Punainen|255|0|0
Vihreä|0|255|0
Sininen|0|0|255
Keltainen|255|255|0
Liila|255|0|255
Turkoosi|0|255|255
Valkoinen|255|255|255
