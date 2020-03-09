import * as helper from './helper';

// Set the I/O file name:
const inputFileName = "I-O Files/input.txt";
const outputFileName = "I-O Files/output.txt";
const outputFileName2 = "I-O Files/language.txt";

// Read from the file:
var language = helper.getLanguage(inputFileName);
helper.reminder(language);
var word = helper.getWord(inputFileName);

// Build the First Follow table:
var firstFollowTable = helper.buildFirstFollowTable(language);

// Build the Parser table:
var parserTable = helper.buildParserTable(language, firstFollowTable);

// Write the language and generated tables to a different file, for additional info:
helper.writeLanguageToFile(outputFileName2, language, firstFollowTable, parserTable);

// Get the left-most derivation of word:
var wordDerivation = helper.getDerivation(language, word, parserTable);

// Now write to file:
wordDerivation.write(outputFileName);
