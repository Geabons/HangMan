//#region Don't look behind the curtain
// Do not worry about the next two lines, they just need to be there. 
import * as readlinePromises from 'node:readline/promises';
const rl = readlinePromises.createInterface({ input: process.stdin, output: process.stdout });

async function askQuestion(question) {
    return await rl.question(question);
}

//#endregion

import { ANSI } from './ansi.mjs';
import { HANGMAN_UI } from './graphics.mjs';
import { WORD_LIST } from './wordList.mjs';

/*
    1. Pick a word
    2. Draw one "line" per char in the picked word.
    3. Ask player to guess one char || the word (knowledge: || is logical or)
    4. Check the guess.
    5. If guess was incorrect; continue drawing 
    6. Update char display (used chars and correct)
    7. Is the game over (drawing complete or word guessed)
    8. if not game over start at 3.
    9. Game over
*/

const TEXT_TO_PLAYER = { 
    ASK_QUESTION: "Guess the char or the word :",
    VICTORY_MESSAGE: "You Win",
    GAME_OVER_MESSAGE: "Game Over",
    REPLAY: "Do you wish to play again?",
    TOTAL_GAMES: "Total games played:",
    TOTAL_CORRECT_GUESSES: "Total correct guesses made:",
    TOTAL_WRONG_GUESSES: "Total wrong guesses made:"
}
let correctWord = "";
let numberOfCharInWord = 0;
let guessedWord = "".padStart(correctWord.length, "_");
let displayedWord = "";
let isGameOver = false;
let wasGuessCorrect = false;
let wrongGuesses = [];

let totalCorrectGuesses = 0;
let totalWrongGuesses = 0;
let totalGames = 0;

//displayedWord += ANSI.COLOR.GREEN;

await startGame();

function consoleDisplay() {
    console.log(ANSI.CLEAR_SCREEN);
    console.log(displayWord());
    console.log(drawList(wrongGuesses, ANSI.COLOR.RED));
    console.log(HANGMAN_UI[wrongGuesses.length]);
}

function displayWord() {

    displayedWord = "";

    for (let i = 0; i < numberOfCharInWord; i++) {
        
        if (guessedWord[i] != "_") {
            displayedWord += ANSI.COLOR.GREEN;
        }
        displayedWord += guessedWord[i] + " ";
        displayedWord += ANSI.RESET;
        
    }

    return displayedWord;
}

async function startGame() {
    
let replayAnswer = "";
    do{
        correctWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].toLowerCase(); 
        numberOfCharInWord = correctWord.length;
        guessedWord = "".padStart(correctWord.length, "_");
        displayedWord = "";
        isGameOver = false;
        wasGuessCorrect = false;
        wrongGuesses = [];
        await game();
        replayAnswer = (await askQuestion(TEXT_TO_PLAYER.REPLAY)).toLowerCase();
        totalGames++;
    }while(replayAnswer == "yes")
}

function drawList(list, color) {
    let output = "";

    for (let i = 0; i < list.length; i++) {
        if (!output.includes(list[i])){
            output += list[i] + " ";
        }
    }

    return color + output + ANSI.RESET;
}

// Continue playing until the game is over. 
async function game(){
    while (!isGameOver) {

        consoleDisplay();
    
        const answer = (await askQuestion(TEXT_TO_PLAYER.ASK_QUESTION)).toLowerCase();

        if (answer == correctWord) {
            isGameOver = true;
            wasGuessCorrect = true;
        } else if (ifPlayerGuessedLetter(answer)) {
    
            let org = guessedWord;
            guessedWord = "";
    
            let isCorrect = false;
            for (let i = 0; i < correctWord.length; i++) {
                if (correctWord[i] == answer) {
                    totalCorrectGuesses++;
                    guessedWord += answer;
                    isCorrect = true;
                } else {
                    // If the currents answer is not what is in the space, we should keep the char that is already in that space. 
                    guessedWord += org[i];
                }
            }
    
            if (!isCorrect) {
                wrongGuesses.push(answer);
                totalWrongGuesses++;
            } else if (guessedWord == correctWord) {
                isGameOver = true;
                wasGuessCorrect = true;
            }
        }
    
        // Read as "Has the player made to many wrong guesses". 
        // This works because we cant have more wrong guesses then we have drawings. 
        if (wrongGuesses.length == HANGMAN_UI.length) {
            isGameOver = true;
        }
    
    
    }
    consoleDisplay();
}

// OUR GAME HAS ENDED.

console.log(ANSI.CLEAR_SCREEN);
console.log(displayWord());
console.log(drawList(wrongGuesses, ANSI.COLOR.RED));
    //&console.log(HANGMAN_UI[wrongGuesses.length]);
console.log(TEXT_TO_PLAYER.TOTAL_GAMES + " " + totalGames);
console.log(TEXT_TO_PLAYER.TOTAL_WRONG_GUESSES + " " + totalWrongGuesses);
console.log(TEXT_TO_PLAYER.TOTAL_CORRECT_GUESSES + " " + totalCorrectGuesses);
if (wasGuessCorrect) {
    console.log(ANSI.COLOR.YELLOW + TEXT_TO_PLAYER.VICTORY_MESSAGE);
} else {
    console.log(TEXT_TO_PLAYER.GAME_OVER_MESSAGE);
}

process.exit();

function ifPlayerGuessedLetter(answer) {
    return answer.length == 1
}

