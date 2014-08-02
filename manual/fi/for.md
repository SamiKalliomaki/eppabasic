`For`
==========

Komento `For` määrittelee silmukan,
joka käy läpi joukon lukuja.

Silmukan määrittely on:

    For [muuttuja] = [alku] To [loppu]
    Next [muuttuja]

Tämä käy läpi välillä `[alku]`..`[loppu]` olevat luvut.

Lisäksi silmukkaan voi liittää askeleen:

    For [muuttuja] = [alku] To [loppu] Step [askel]
    Next [muuttuja]

Nyt joka kierroksella muuttujan arvo kasvaa `[askel]` verran.    
    
Esimerkki 1
----------

    For i = 1 To 10
        Print i
    Next i
    
Esimerkki 2
----------

    For i = 10 To 50 Step 10
        Print i
    Next i