<!--input-->
MouseDown
=========

```eppabasic
Function MouseDown(näppäin As Integer) As Boolean
```

Palauttaa tiedon, onko hiiren näppäin `näppäin` painettuna.

Näppäin|Tunnus
-------|------
Vasen|1
Oikea|2
Keskimmäinen|3

Example
---------
```eppabasic
Do
    ClearScreen
    If MouseDown(1) Then
        Print "Vasen nappi alhaalla"
    End If
    If MouseDown(2) Then
        Print "Oikea nappi alhaalla"
    End If
    If MouseDown(3) Then
        Print "Keskinappi alhaalla"
    End If
    DrawScreen
Loop
```
