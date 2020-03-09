import * as fs from 'fs';
import Language from "./Classes/Language";
import CustomSyntaxError from "./Classes/CustomSyntaxError";

import FirstFollowTable from "./Classes/FirstFollowTable";
import ParsingTable from "./Classes/ParsingTable";
import WordDerivation from "./Classes/WordDerivation";

// Read functions:
function readFileData(fileName) {
    var data = fs.readFileSync(fileName, 'utf8');
    return data.toString().split(/\r\n|\r|\n/);
}
function getWord(fileName) {
    return readFileData(fileName)[0];
}
function getLanguage(fileName) {
    var language = new Language();
    language.formatLanguageFromStringArray(readFileData(fileName).splice(1));
    return language;
}

function errorGenerator(stack, input, ip, word, output) {
    var msg = "LL1 syntax error at '" + input[ip] + "' in word '" + word + " " + input[input.length -1] + "'.\n\n";
    if(output != "")
        msg = msg + "After applying:\n" + output + "\n";
    else
        msg = msg + "On first try.\n\n";
    msg = msg + "Symbol stack: " + p(stack) + "\n";
    throw new CustomSyntaxError(msg);
}

function p(arr, prec) {
    if(prec == null || prec == undefined)
        prec = '';
    var output = '';
    const n = arr.length;
    for(let i = 0; i < n-1; i++) {
        if(arr[i] != null)
            output = output + prec + arr[i] + '; ';
        else
            output = output + arr[i] + '; ';
    }
    if(arr[n-1] != null)
        output = output + prec + arr[n-1] + '; ';
    else
        output = output + arr[n-1] + '; ';
    return output;
}

function reminder(language) {
    // Write reminder about special characters:
    var consoleOutput = "!Reminder! special characters used in file are:\n\n" + "Lambda: '" + language.lambda + "';\n";
    consoleOutput = consoleOutput + "Production separator: '" + language.separator + "';\n" + "Multiple rule separator: '" + language.multiple + "';\n";
    consoleOutput = consoleOutput + "Special charcter: '" + language.special + "'\n\n" + "You can always change them in the 'Language.js' class file.\n";

    console.log(consoleOutput);
}

function writeLanguageToFile(languageFileName, language, firstFollowTable, parsingTable) {
    // Write the language in output:
    var output = '************\nLanguage\n************\n\n';
    output = output + 'Lambda symbol: ' + language.start + '\n';
    output = output + 'Start symbol: ' + language.lambda + '\n';
    output = output + 'Terminals: ' + p(language.terminals) + '\n';
    output = output + 'Non-terminals: ' + p(language.nonTerminals) + '\n';
    output = output + 'Productions: ' + p(language.rules) + '\n';

    // Write the firstFollowTable in output:
    output = output + '\n************\nFirst Follow Table\n************\n\n';
    firstFollowTable.entries.forEach(entry => {
        if(language.nonTerminals.includes(entry.symbol))
            output = output + 'Symbol: ' + entry.symbol + '; First = {' + p(entry.first) + '}; Follow = {' + p(entry.follow) + '}\n';
    });

    // Write the parsingTable in output:
    output = output + '\n************\nParsing Table\n************\n\n';
    output = output + '            ' + p(parsingTable.columnNames) + '\n';
    parsingTable.rowNames.forEach(s => {
        output = output + s + ':          ';
        var tmp = [];
        parsingTable.columnNames.forEach(c => {
            tmp.push(parsingTable.getValue(s, c));
        });
        output = output + p(tmp, s + ' -> ') + '\n';
    });

    // Write to file:
    fs.writeFile(languageFileName, output, () => {});
}

function buildFirstFollowTable(language) {
    var firstFollowTable = new FirstFollowTable();
    firstFollowTable.buildFromLanguage(language);
    return firstFollowTable;
}

function buildParserTable(language, firstFollowTable) {
    var parsingTable = new ParsingTable(language.nonTerminals, language.terminals, language.lambda, language.special);
    parsingTable.buildFromFirstFollowTable(firstFollowTable, language);
    return parsingTable;
}

// Left-most derivation of word function:
function getDerivation(language, word, parsingTable) {

    var wordDerivation = new WordDerivation();
    try {
        var terminals = language.terminals;

        var stack = [language.special, language.start];
        var input = word.split(' ');
        input.push(language.special);
        var ip = 0;
        var output = "";
        var X = language.start;

        while(X != language.special) {
            if(X == input[ip]) {
                stack.pop();
                ip = ip+1;
            } else {
                var a = input[ip];
                if(a == language.lambda)
                    a = language.special;
                var parsingTableCurrentValue = parsingTable.getValue(X, a);
                if(terminals.includes(X) || parsingTableCurrentValue == null)
                    errorGenerator(stack, input, ip, word, output);
                else {
                    output = output + X + " " + language.separator + " " + parsingTableCurrentValue + "\n";
                    stack.pop();
                    var inv = parsingTableCurrentValue.split(" ");
                    inv.reverse();
                    inv.forEach(element => {
                        if(element != language.lambda)
                            stack.push(element)
                    });
                }
            }
            X = stack[stack.length - 1];
        }

    } catch(e) {
        if (e instanceof CustomSyntaxError) {
            wordDerivation.setSyntaxError(e.message);
            return wordDerivation;
        }
        throw(e);
    }

    wordDerivation.setDerivation(output);
    return wordDerivation;
}

export {
    getWord,
    getLanguage,
    reminder,
    writeLanguageToFile,

    buildFirstFollowTable,
    buildParserTable,
    getDerivation
};
