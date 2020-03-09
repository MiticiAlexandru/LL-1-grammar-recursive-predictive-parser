// Create the ParsingTable class:
class ParsingTable {
    constructor(rowNames, columnNames, lambda, special) {
        // Replace lambda with special char in column names:
        var ok = 0;
        columnNames = columnNames.filter(function(value, index, arr){
            if(value == lambda) {
                ok = 1;
                return false;
            }
            return true;
        });
        if(ok == 1)
            columnNames.push(special);

        this.rowNames = rowNames;
        this.columnNames = columnNames;
        this.rowNum = rowNames.length;
        this.columnNum = columnNames.length;

        this.values = [];
        for(let i=0;i<this.rowNum;i++) {
            var tmp = [];
            for(let j=0;j<this.columnNum;j++)
                tmp.push(null);
            this.values.push(tmp);
        }
    }

    setValue(value, X, a) {
        let i = this.rowNames.indexOf(X);
        let j = this.columnNames.indexOf(a);
        this.values[i][j] = value;
    }

    getValue(X, a) {
        let i = this.rowNames.indexOf(X);
        let j = this.columnNames.indexOf(a);
        return this.values[i][j];
    }

    /*
    Algorithm used to create the Parsing Table:

    for each production X → Y
        for each a ∊ first(Y)
            add X → Y to M[X , a]
        if 𝜀 ∊ first(Y) then
            for each b ∊ follow(X)
                add X → Y to M[X , b]

    */
    buildFromFirstFollowTable(firstFollowTable, language) {
        language.rules.forEach(production => {
            // X
            var symbol = production.split(language.separator)[0].trim();
            // Y
            var value = production.split(language.separator)[1].trim();
            // first(Y)
            var entry = firstFollowTable.getEntryAdvanced(value, language.lambda);
            // follow(X)
            var orig = firstFollowTable.getEntry(symbol);
            var ok = 0;
            entry.first.forEach(fi => {
                var newFi = fi;
                if(fi == language.lambda) {
                    ok = 1;
                    newFi = language.special;
                }
                this.setValue(value, symbol, newFi);
            });
            if(ok == 1) {
                orig.follow.forEach(fo => {
                    var newFo = fo;
                    if(fo == language.lambda) {
                        newFo = language.special;
                    }
                    this.setValue(value, symbol, newFo);
                });
            }
        });
    }
}

export default ParsingTable;
