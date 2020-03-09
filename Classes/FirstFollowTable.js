// Create the FirstFollowTableEntry class:
class FirstFollowTableEntry {
    constructor(symbol, first, follow) {
        this.symbol = symbol;
        this.first = first;
        this.follow = follow;
    }
}

// Create the FirstFollowTable class:
class FirstFollowTable {
    constructor() {
        this.entries = [];
    }

    // Initialize symbol for new entry in the FirstFollowTable:
    addEntry(symbol) {
        var exists = this.getEntry(symbol);
        if(exists == null) {
            var entry = new FirstFollowTableEntry(symbol, [], []);
            this.entries.push(entry);
        }
    }

    // Add value to list of first values for symbol:
    addToFirst(symbol, value) {
        var entry = this.getEntry(symbol);
        if(entry != null) {
            entry.first.push(value);
        }
    }

    // Add value to list of follow values for symbol:
    addToFollow(symbol, value) {
        var entry = this.getEntry(symbol);
        if(entry != null) {
            entry.follow.push(value);
        }
    }

    getEntryAdvanced(symbol, lambda) {
        var ok = this.getEntry(symbol);
        var ok2 = 0;
        if(ok != null)
            return ok;
        else {
            // When symbol is Y1Y2...Yn, get first(Y1Y2...Yn):
            var tmp = symbol.split(' ');
            var res = [];
            tmp.forEach(s => {
                if(ok2 == 0) {
                    var fst = this.getEntry(s).first;
                    // Make sure that each value appears only once:
                    fst = fst.filter((value, index, self) => {
                        return self.indexOf(value) === index;
                    });
                    if(fst != [lambda]) {
                        fst.forEach(elem => {
                            res.push(elem);
                        });
                    }
                    if(!fst.includes(lambda)) {
                        // Make sure that each value appears only once:
                        res = res.filter((value, index, self) => {
                            return self.indexOf(value) === index;
                        });
                        ok2 = 1;
                    }
                }
            });
            if(ok2 == 1)
                return new FirstFollowTableEntry(symbol, res, []);
            else
                return new FirstFollowTableEntry(symbol, [lambda], []);
        }
    }

    getEntry(symbol) {
        let ok = 0;
        var entry;
        this.entries.forEach(element => {
            if(element.symbol == symbol) {
                entry = element;
                ok = 1;
            }
        });
        if(ok == 1)
            return entry;
        else
            return null;
    }

    buildFromLanguage(language) {
        // First, for each terminal, make first = same terminal:
        language.terminals.forEach(terminal => {
            this.addEntry(terminal);
            this.addToFirst(terminal, terminal);
        });
        // Create an entry for each non-terminal:
        language.nonTerminals.forEach(nonTerminal => {
            this.addEntry(nonTerminal);
        });
        // Set the first for each non-terminal:
        language.nonTerminals.forEach(nonTerminal => {
            var fi = this.buildFirst(language, nonTerminal);
            // Eliminate repeating values:
            fi = fi.filter((value, index, self) => {
                return self.indexOf(value) === index;
            });
            // Add to entry:
            fi.forEach(elem => {
                this.addToFirst(nonTerminal, elem);
            });
        });
        // Set the follow for each non-terminal:
        language.nonTerminals.forEach(nonTerminal => {
            var fo = this.buildFollow(language, nonTerminal);
            // Eliminate repeating values:
            fo = fo.filter((value, index, self) => {
                return self.indexOf(value) === index;
            });
            // Add to entry:
            fo.forEach(elem => {
                this.addToFollow(nonTerminal, elem);
            });
        });
    }

    /*
    A recursive function that takes a symbol X and the language and returns first(X), by applying the following rules:

    If X is terminal, FIRST(X) = {X}.
    If X → ε is a production, then add ε to FIRST(X).
    If X is a non-terminal, and X → Y1 Y2 … Yk is a production, and ε is in all of FIRST(Y1), …, FIRST(Yk), then add ε to FIRST(X).
    If X is a non-terminal, and X → Y1 Y2 … Yk is a production, then add a to FIRST(X) if for some i, a is in FIRST(Yi), and ε is in all of FIRST(Y1), …, FIRST(Yi-1).
    */
    buildFirst(language, symbol) {
        var type = language.getSymbolType(symbol);
        var fi = [];

        // Check the type of the symbol we are at:
        switch(type) {
            // Non-terminal:
            case 0:
                var rules = language.getRulesStartingWithSymbol(symbol);
                rules.forEach(rule => {
                    var all = rule.split(language.separator)[1];
                    all = all.split(' ');
                    var ok = 0, i = 0, tmpFi, ok2;
                    while(i < all.length && ok == 0) {
                        var tmpFi = this.buildFirst(language, all[i]);
                        // We ask ourselves if lambda has been encountered (meaning, we need to continue)
                        ok2 = 0;
                        if(!tmpFi.includes(language.lambda))
                            ok2 = 1;

                        // Eliminate lambda from result set:
                        tmpFi = tmpFi.filter(function(value, index, arr){
                            if(value == language.lambda)
                                return false;
                            return true;
                        });
                        // If there is anything left, that becomes first:
                        if(tmpFi.length > 0) {
                            tmpFi.forEach(elem => {
                                fi.push(elem);
                            });
                            if(ok2 == 1)
                                ok = 1;
                        }
                        i = i+1;
                    }
                    if(ok == 0)
                        fi.push(language.lambda);
                });
            break;
            // Terminal:
            case 1:
                fi.push(symbol);
            break;
            // Empty:
            case 2:
                fi.push(language.lambda);
            break;
        }
        return fi;
    }

    /*
    A recursive function that takes a symbol X and the language and returns follow(X), by applying the following rules:

    If $ is the input end-marker, and S is the start symbol, $ ∈ FOLLOW(S).
    If there is a production A → αBβ then (FIRST(β) – ε) ⊆ FOLLOW(B).
    If there is a production A → αB or a production A → αBβ where  ε ∈ FIRST(β), then FOLLOW(A) ⊆ FOLLOW(B).
    */
    buildFollow(language, symbol) {
        var fo = [];
        // Add the special character to follow(start):
        if(symbol == language.start)
            fo.push(language.special);
        var productions = language.getProductionsContainingSymbol(symbol);
        productions.forEach(production => {
            var s = production.split(language.separator)[1].trim().split(' ');
            var n = s.length;
            var ok = 0;
            for(let i = s.indexOf(symbol) + 1; i < n && ok == 0; i++) {
                var entry = this.getEntry(s[i]);
                entry.first.forEach(fi => {
                    if(fi != language.lambda)
                        fo.push(fi);
                });
                if(!entry.first.includes(language.lambda))
                    ok = 1;
            }
            // We haven't finished yet, time to apply last rule:
            if(ok == 0 && symbol != production.split(language.separator)[0].trim()) {
                var followOfStarterSymbol = this.buildFollow(language, production.split(language.separator)[0].trim());
                followOfStarterSymbol.forEach(elem => {
                    fo.push(elem);
                });
            }
        });

        // Eliminate repeating values:
        fo = fo.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
        return fo;
    }
}

export default FirstFollowTable;
