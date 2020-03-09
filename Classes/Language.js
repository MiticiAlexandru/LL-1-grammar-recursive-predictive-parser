// Set the lambda, the rule separator, the special character and the rule with multiple outcomes separator symbols:
const Lambda = '~';
const Separator = '->';
const Multiple = '|';
const Special = '$';

// Create the Language class:
class Language {
    constructor() {
        this.start = null;
        this.terminals = null;
        this.nonTerminals = null;
        this.rules = null;
        this.originalRules = null;
        this.lambda = Lambda;
        this.separator = Separator;
        this.multiple = Multiple;
        this.special = Special;
    }

    // Acts as a secondary constructor:
    setLanguage(start, terminals, nonTerminals, rules, originalRules) {
        this.start = start;
        this.terminals = terminals;
        this.nonTerminals = nonTerminals;
        this.rules = rules;
        this.originalRules = originalRules;
    }

    // Check if symbol is terminal or non-terminal;
    // Function returns 1 for terminal, 0 for non-terminal, 2 for lambda and -1 if it doesn't exist in the language:
    getSymbolType(symbol) {
        var res = -1;
        if(symbol == this.Lambda)
            res = 2;
        this.terminals.forEach(terminal => {
            if(symbol == terminal)
                res = 1;
        });
        this.nonTerminals.forEach(nonTerminal => {
            if(symbol == nonTerminal) {
                res = 0;
            }
        });
        return res;
    }

    // Returns an array containing the rules starting with the given symbol:
    getRulesStartingWithSymbol(symbol) {
        var r = [];
        if(this.getSymbolType(symbol) != 0)
            return r;
        this.rules.forEach(rule => {
            if(rule.split(this.separator)[0].trim() == symbol)
                r.push(rule);
        });
        return r;
    }

    // Returns an array containing the rules starting with the given symbol:
    getProductionsContainingSymbol(symbol) {
        var r = [];
        this.rules.forEach(rule => {
            var tmp = rule.split(this.separator)[1].trim();
            tmp = tmp.split(' ');
            if(tmp.includes(symbol))
                r.push(rule);
        });
        return r;
    }

    // Format language function:
    formatLanguageFromStringArray(language) {
        var filtered = language.filter(function (el) { return el != ""; });
        var final = [];
        var left = [];
        var right = "";

        // Split every rule in 2, using the Separator:
        filtered.forEach(element => {
            var tmp = element.split(Separator);
            tmp[0] = tmp[0].trim();
            left.push(tmp[0]);
            right = right + tmp[1];

            // Check for rules containing Multiple:
            var tmp2 = tmp[1].split(Multiple);
            while(tmp2.length > 0) {
                tmp2[0] = tmp2[0].trim();
                final.push(tmp[0] + ' ' + Separator + ' ' + tmp2[0]);
                tmp2.shift();
            }
        });

        // Eliminate all non-terminal characters from right to get terminals:
        const start = left[0];
        left.forEach(element => {
            right = right.replace(new RegExp(' ' + element + ' ', 'g'), ' ');
        });
        right = right.split(' ');
        right = right.filter(function(value, index, arr){
            if(value == '' || /\r\n|\r|\n/.test(value))
                return false;
            return true;
        });

        // Make sure that terminals and non-terminals appear only once:
        left = left.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
        right = right.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
        const index = right.indexOf('|');
        if (index > -1) {
            right.splice(index, 1);
        }

        this.start = start;
        this.terminals = right;
        this.nonTerminals = left;
        this.rules = final;
        this.originalRules = filtered;
    }
}

export default Language;
