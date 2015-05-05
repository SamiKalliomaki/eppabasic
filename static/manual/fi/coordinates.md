Koordinaatisto
==============

Kuvioita piirtäessä tietokoneelle on kerrottava,
mihin kohtaan ruutua haluttu kuvio piirretään.
Jotta ohjelmoija voi välittää tietokoneelle
aikomuksensa kuvion sijainniksi tarvitaan sopimus,
joka määrittelee, miten sijainnit näytöllä on ilmoitettava.
Tätä sopimusta kutsutaan koordinaatistoksi.

![Kuva koordinaatistosta](img/coordinates1.png)

Pisteet näytöllä ilmoitetaan kahden luvun avulla ja
sitä merkitään `(x, y)`.
Merkintä tarkoittaa, että haluttu piste on
`x` yksikköä ruudun vasemmasta laidasta oikealle
ja `y` yksikköä ruudun ylälaidasta alas.

EppaBasicissa käytetään tietokoneille tyypillisesti koordinaatistoa,
jossa origo (piste `(0, 0)`) on ruudun vasemmassa yläkulmassa.
Huomaa, että tämä poikkeaa matematiikassa yleisesti käytetystä
koordinaatistosta, jossa origo sijaitsee vasemmassa alakulmassa.
