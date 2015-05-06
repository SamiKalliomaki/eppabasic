<!--math-->
Randomize
=========

```eppabasic
Sub Randomize(seed As Integer)
```

Initializes random number generator using given seed.
Random number generator initialized using the same seed always produces same numbers.
By default, time based value is used seed.

Example
---------
```eppabasic
Randomize 12345
Print Rnd()     ' 0.85374588
Print Rnd()     ' 0.93714768
Print Rnd()     ' 0.66572763
```
