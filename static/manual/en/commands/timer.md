<!--time-->
Timer
=====

```eppabasic
Function Timer() As Integer
```

Returns the current unix timestamp.
Unix timestamp is the number of seconds since 00:00:00 1 January 1970.
Leap seconds are not counted in this number so the time is not entirely accurate.

Useful for monitoring time used by the program.

Example
---------
```eppabasic
' Measure how long does it take for the user to press space
Print "Press Space"
Dim start = Timer()
Do Until KeyHit(ebKeySpace)
    DrawScreen
Loop
Print Timer() - start
```
