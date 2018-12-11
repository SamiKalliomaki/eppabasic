# [EppaBasic](http://eppabasic.fi)

EppaBasic (shorthened EB or eb) is a web-based basic programming language.
It is mainly designed for begining programming, but it can also be used for quick demos.
And of course for creating games (though many features are still missing).

# History

## The birth
The idea of a new programming language was born at Copenhagen Airport in spring 2014
when the [BOI](http://www.boi2014.lmio.lt/) team of Finland was returning home from Lithuania.
We were discussing about how programming is tried to get as a subject to Finnish schools
and about which programming language would be good for teaching programming.

We were thinking that creating graphics is much more interesting for young pupils
than trying to create some text based programs.
"How about a c++ library or header with simple drawing commands like ```line (int x1, int y1, int x2, int y2)```
or ```circle (int x, int y, int r)``` and an easy way for creating windows" someone said.
"That sounds like a great idea, though wouldn't it just be adding some syntax candy over an existing language.
What's the idea of that? Whouldn't it just bethe easier to create a new programming language."

Obviously the next question was what kind of language it would be.
As a result of a quick poll we discovered that many of us had begun programming with a basic language.
Some with [CoolBasic](http://www.coolbasic.com/index.php?lang=en),
others with [QuickBasic](http://en.wikipedia.org/wiki/QuickBASIC)
or with [Visual Basic .NET](http://en.wikipedia.org/wiki/Visual_Basic_.NET).
But why not to use those languages?
Well, both CoolBasic and QuickBasic are old and neither one has been updated for a long time.
And the Visual Basic .NET is ment for making Windows Forms Applications, not simple graphical games.
The final nail to their coffins was that they all require downloading and installing a large IDE.
For us that meant that a modern, easy to use basic programming language was needed.
And because browsers are now everywhere and have begun more and more powerfull,
we decided that making it to work in browsers was the way to go.

## Later
After the idea was born, the way was anything but smooth.
When the idea was first introduced in IRC, many laughed at it
and said that it never would be a notable programming language.
But when Henkkuli showed the first working version of the compiler a couple of weeks later,
the laugh turned to wonder.

In the begining the editor was just a html textarea and pressing the run button
just dumped a lot of debug information to the screen.
But in the summer, when the developers had more time,
Scintillo wrote a new editor, and the compiler was also rewriten by Henkkuli.
In the end of the summer, the runtime was also rewriten and we moved to use requirejs
instead of just adding tons of script tags to the page header.

## The future
After the summer 2014, the development has been more or less on halt.
We are still hoping that we, or someone else, would have time to continue the development in the future.

Best regards,  
EppaBasic development team.
