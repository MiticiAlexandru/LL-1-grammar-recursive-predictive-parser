# LL(1) grammar recursive predictive parser

## Introduction

I started working on this as a project for university and saw that there weren't many examples of how to build a recursive predictive parser for an LL(1) grammar. Specifically, I found some pseudocode on how to do it using a predictive parser table. The input I had, however, was just a word and the LL(1) grammar itself.

The parser I was asked to build would output the derivation of a word or, if the word could not be formed by the grammar, the first symbol causing the error and all the productions generated up to that point.

The program is written in `JavaScript`, with `Node.js`. In the [Program description](#program-description) section I give a short description of some trickier bits of code and the rules used to create the tables and the parser. Or you could just skip ahead to the [Input output and predefined symbols](#input-output-and-predefined-symbols) section if you just want to see how it works.

The core sections of the program are written in the files from the `Classes` folder and the `helper.js` file. If you want to integrate it into your project, you can just call the functions from the helper file. Look to the `exec.js` file for how it works.

## Program description

Below is the pseudocode I [found](https://www.tutorialspoint.com/compiler_design/compiler_design_top_down_parser.htm), where M is a `predictive parser table` and w is the word:

    push $ and S on the stack
    a = (first symbol of w)
    X = S
    while(X != $) {
        if(X == a) {
            pop X from stack
            a = (next symbol of w)
        }
        else if(X is a terminal) error();
        else if( M[X,a] is empty ) error();
        else {
            output the production M[X,a]
            pop X from stack
            push the right hand side of M[X,a] on the stack in reverse order
        }
        X = (symbol on top of the stack)
    }

The bigger challenge was building the `predictive parser table` and the `first follow table`. The first step was creating a `Language` class, containing the productions, terminals, non-terminals, start symbol and some other data. Then I applied the following rules for creating the `first follow table`:

FIRST COLUMN RULES:

* If X is terminal, FIRST(X) = {X}.
* If X → ε is a production, then add ε to FIRST(X).
* If X is a non-terminal, and X → Y1 Y2 … Yk is a production, and ε is in all of FIRST(Y1), …, FIRST(Yk), then add ε to FIRST(X).
* If X is a non-terminal, and X → Y1 Y2 … Yk is a production, then add a to FIRST(X) if for some i, a is in FIRST(Yi), and ε is in all of FIRST(Y1), …, FIRST(Yi-1).

FOLLOW COLUMN RULES:

* If $ is the input end-marker, and S is the start symbol, $ ∈ FOLLOW(S).
* If there is a production A → αBβ then (FIRST(β) – ε) ⊆ FOLLOW(B).
* If there is a production A → αB or a production A → αBβ where  ε ∈ FIRST(β), then FOLLOW(A) ⊆ FOLLOW(B).

From there, I applied the following algorithm to create the `predictive parser table`:

    for each production X → Y
        for each a ∊ first(Y)
            add X → Y to M[X , a]
        if 𝜀 ∊ first(Y) then
            for each b ∊ follow(X)
                add X → Y to M[X , b]

I got the rules for the `first follow table` from [here](https://sites.tufts.edu/comp181/2013/10/05/first-and-follow-sets/).
A special shout-out to Ravindrababu Ravula for his [youtube lectures](https://www.youtube.com/watch?v=_uSlP91jmTM), I would not have managed to understand the process of a recursive predictive parser without his help or create the algorithm for the `first follow table` and `predictive parser table`.

## Input output and predefined symbols

Run the program by using the `npm start` script defined in the `package.json` file. Don't forget to run the npm install command for dependencies (I just used `esm`).
You can find the input and output files in the I-O Files folder. There is also an additional file containing the language, `first follow table` and `predictive parser table` if you need them.

The input file takes the word to be analyzed on the first line and the language in the rest of the file. Below is a valid example of the contents of the input file:

    id * id + id

    E -> T E'
    E' -> + T E' | ~
    T -> F T'
    T' -> * F T' | ~
    F -> id | ( E )

There are a number of predefined symbols used by the program, all located in the `Language.js` file. You can change them there if you wish. The symbols are:

* Lambda (or Epsilon, depending on who you learnt compilers and parsers with), set as `~` by default;
* Separator (the separator present in all productions, ie: `E -> T E'`), set as `->` by default;
* Multiple (the separator between different paths of a production, ie: `E' -> + T E' | ~`), set as `|` by default;
* Sepcial (the symbol used to stop the parser), set as `$` by default;

The language start symbol is the starter symbol of the first production in the file (In the above example, that's `E`).
Furthermore, the program uses spaces to distinguish between symbols. For example, `(E)` is different from `( E )`!
