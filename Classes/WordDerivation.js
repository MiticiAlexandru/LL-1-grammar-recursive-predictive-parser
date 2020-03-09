import * as fs from 'fs';
const msg = "\nFind result in 'output.txt' file. Consult 'language.txt' file for additional info.\n************";
const msg1 = "************\nWORD DERIVATION SUCCESSFUL" + msg;
const msg2 = "************\nWORD DERIVATION FAILURE" + msg;

// Create the WordDerivation class:
class WordDerivation {
    constructor() {
        this.derivation = null;
        this.syntaxError = null;
    }

    setDerivation(derivation) {
        if(this.syntaxError == null)
            this.derivation = derivation;
    }

    setSyntaxError(syntaxError) {
        if(this.derivation == null)
            this.syntaxError = syntaxError;
    }

    write(fileName) {
        if(this.derivation != null)
            fs.writeFile(fileName, this.derivation, () => { console.log(msg1); });
        else {
            if(this.syntaxError != null)
                fs.writeFile(fileName, this.syntaxError, () => { console.log(msg2); });
            else
                throw new Error('Neither the word derivation nor the syntax error was set!');
        }
    }
}

export default WordDerivation;
