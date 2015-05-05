Värien määrittäminen
====================

EppaBasicissa värien määrittämiseen käytetään mallia,
jossa väri koostuu kolmesta värikomponentista:
punaisesta (r), vihreästä (g) ja sinisestä(b).
Värit muodostetaan yhdistelemällä näitä
värikomponentteja eri suhteissa.
Jokaisen komponentin arvo voi olla kokonaisluku
väliltä 0..255.

EppaBasicissa on neljä funktiota,
joilla voidaan muuttaa eri piirtokomentojen käyttämiä värejä.
Funktio|Väriä käytetään
-------|--------------
[ClearColor](manual:/commands/clearcolor)|Ruudun tyhjentämiseen käytettävä väri
[DrawColor](manual:/commands/clearcolor)|Viivakuvioiden piirtämiseen käytettävä väri
[FillColor](manual:/commands/clearcolor)|Täytetyiden kuvioiden piirtämiseen käytettävä väri
[TextColor](manual:/commands/clearcolor)|Tekstin piirtämiseen käytettävä väri


Esimerkkejä väreistä
--------------------
Väri|Punaisen määrä|Vihreän määrä|Sinisen määrä
----|--------------|-------------|-------------
Musta|0|0|0
Punainen|255|0|0
Vihreä|0|255|0
Sininen|0|0|255
Keltainen|255|255|0
Liila|255|0|255
Turkoosi|0|255|255
Valkoinen|255|255|255
