# comp4kids

A playful CS 101 course designed for children with a novel approach.

In general, introductory CS courses (either designed for children or not) take one of two approaches:

- They teach some software in which the student automates tasks such as animations, stories or the
strategy of a game by combining visual structures that resemble programming concepts, like conditionals
and loops. Scratch and the introductory courses in code.org fall in this category. Or...
- They directly start with a real programming language (usually JavaScript or Python)
and try to start simple and go slowly.

The idea of this project is to provide a smooth transition between both. The course
starts with an extremely simple programming language (one with three commands: L, R and W meaning
Left, Right and Wait, respectively) that evolves over the course to accommodate programming
concepts progressively. From the beginning the student writes code in order to play games,
and these programs get increasingly more complex over time. In the end, concepts like
conditionals, functions, loops, integer variables and flags feel natural and a transition
to a more complex programming language can start by simply teaching the equivalent syntax
in that language that maps to concepts that the student already knows well.

The course is divided in 15 classes. The content of most of them is still to be thought of.

| Class | Content | Example program
|---|---|---|
| 1 | The idea that computers execute sequential commands; debugging. Students play a game controlling a simple robot using three commands: L, R and W. | L L W R |
| 2 | Loops that execute a fixed number of times; code blocks. Another game with the robot. | 6L 5U 5[LU] |
| 3 | Nested bounded loops; indentation. | 6[ 2[LR] 2[RL] W ] |
