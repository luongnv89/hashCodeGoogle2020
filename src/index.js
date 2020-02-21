const fs = require('fs');
const { quickSort } = require('./algorithms/quickSort');

const { printOutput, processInputFile } = require('./utils');
// GLOBAL VARIABLES
const allLibraries = [];
const allBooks = {};
const allScannedBooks = {};
const allScannedLibraries = [];
let totalNbDays = 0;
let totalNbLibs = 0;
let totalNbBooks = 0;

class Book {
  constructor(id, score) {
    this.id = Number(id);
    this.score = Number(score);
    this.scanned = false;
  }
}

class Library {
  constructor(id, nbBooks, signupTime, dailyShippedBooks) {
    this.id = Number(id);
    this.nbBooks = Number(nbBooks);
    this.signupTime = Number(signupTime);
    this.dailyShippedBooks = Number(dailyShippedBooks);
    this.allBooks = [];
    this.shippedBooks = [];
    this.maxScores = 0;
    this.signed = false;
  }

  addBook (book) {
    // TODO: order the books in decrese order of score
    this.allBooks.push(book);
  }

  /**
   *
   * @param {Number} nbDayLeft Calculate the maximum score that we can get from this library
   */
  getMaxScore(nbDayLeft) {
    this.maxScores = 0;
    if (this.signed || this.signupTime > nbDayLeft) {
      this.maxScores = 0; // Do not consider the scanned libraries
      return;
    }
    const nbScanDays = nbDayLeft - this.signupTime;
    let maxScannedBooks = nbScanDays * this.dailyShippedBooks;
    const unScannedBooks = this.allBooks.filter(b => !b.scanned);
    // Sort the books to get the best first
    // quickSort(unScannedBooks, true, 'score');
    for (let index = 0; index < unScannedBooks.length; index++) {
      const book = unScannedBooks[index];
      if (!book.scanned) {
        this.maxScores += book.score;
        maxScannedBooks--;
        if (maxScannedBooks === 0) break;
      }
    }
  }

  scan(nbDayLeft) {
    // Marked the scanned libraries
    console.log(`Going to scan libray: ${this.id}`);
    this.signed = true;
    const nbScanDays = nbDayLeft - this.signupTime;
    let maxScannedBooks = nbScanDays * this.dailyShippedBooks;
    const unScannedBooks = this.allBooks.filter(b => !b.scanned);
    // Sort the books to get the best first
    // quickSort(unScannedBooks, true, 'score');
    for (let index = 0; index < unScannedBooks.length; index++) {
      const book = unScannedBooks[index];
      if (!book.scanned) {
        this.shippedBooks.push(book.id);
        book.scanned = true;
        maxScannedBooks--;
        if (maxScannedBooks === 0) break;
      }
    }
    if (this.shippedBooks.length > 0) return true;
    return false;
  }
}

/**
 * extract the needed data from an output data
 * @param {Object} data a unit of output data
 */
const outputProcessFct = (data) => {
  return data.split(' ').length;
}

// PROCCESS INPUT FILE
let inputLineIndex = 0;
let isLibText = true;
let libIndex = 0;
/**
 * Process a data line
 * @param {String} line content of a line data
 */
const lineProcessFct = (line) => {
  // console.log('Process line ...', line);
  const array = line.split(' ');
  if (inputLineIndex === 0) {
    // This is the first line
    totalNbBooks = Number(array[0]);
    totalNbLibs = Number(array[1]);
    totalNbDays = Number(array[2]);
  } else if (inputLineIndex === 1) {
    // This is the scoreds of the books
    // Initialize list of all books
    for (let index = 0; index < totalNbBooks; index++) {
      const book = new Book(index, array[index]);
      allBooks[index] = book;
    }
  } else {
    if (isLibText) {
      // This is the first line
      const library = new Library(libIndex, Number(array[0]), Number(array[1]), Number(array[2]));
      allLibraries[libIndex] = library;
    } else {
      // This is the line describe the books in current libraries
      const library = allLibraries[libIndex];
      for (let index = 0; index < array.length; index++) {
        const bookID = Number(array[index]);
        // Add new Book into library
        library.addBook(allBooks[bookID]);
      }
      quickSort(library.allBooks, true, 'score');
      // Go to next library
      libIndex++;
    }
    // Switch the value
    isLibText = !isLibText;
  }
  inputLineIndex++;
}

const getRandomIndex = (max) => {
  const rand = Math.random();
  return Math.floor(rand * max);
}


const findSolutionRandom = () => {
  let remainDays = totalNbDays;
  let libCanSignups = allLibraries.filter(l => l.signupTime < remainDays && !l.signed);
  while(libCanSignups.length) {
    const randomLibIndex = getRandomIndex(libCanSignups.length);
    const scannedLib = libCanSignups[randomLibIndex];
    if (scannedLib.scan(remainDays)) {
      allScannedLibraries.push(scannedLib);
      remainDays -= scannedLib.signupTime;
      libCanSignups = libCanSignups.filter(l => l.signupTime < remainDays && !l.signed);
    };
  }
  // printOutput(outputPath, allScannedLibraries);
}

/**
 * Find the solution - 01
 * - select the library which has the signup process time small first
 */
const findSolutionSignupTime =  () => {
  quickSort(allLibraries, true, "nbBooks");
  quickSort(allLibraries, false, "signupTime");
  let libIndex = 0;
  let remainDays = totalNbDays;
  while(remainDays > allLibraries[libIndex].signupTime) {
    const scannedLib = allLibraries[libIndex];
    if (scannedLib.scan(remainDays)) {
      allScannedLibraries.push(scannedLib);
      remainDays -= allLibraries[libIndex].signupTime;
      if (allLibraries.length === libIndex) {
        break;
      }
    };
    libIndex++;
  }
  // console.log(allScannedLibraries);
  // printOutput(outputPath, allScannedLibraries);
}

/**
 * Find the solution - 01
 * - select the library which has the signup process time small first
 */
const findSolutionNumberOfBooks =  () => {
  quickSort(allLibraries, false, "signupTime");
  quickSort(allLibraries, true, "nbBooks");
  let libIndex = 0;
  let remainDays = totalNbDays;
  while(remainDays > allLibraries[libIndex].signupTime) {
    const scannedLib = allLibraries[libIndex];
    if (scannedLib.scan(remainDays)) {
      allScannedLibraries.push(scannedLib);
      remainDays -= allLibraries[libIndex].signupTime;
      if (allLibraries.length === libIndex) {
        break;
      }
    };
    libIndex++;
  }
  // console.log(allScannedLibraries);
  // printOutput(outputPath, allScannedLibraries);
}

const findSolutionDailyShippedBooks =  () => {
  quickSort(allLibraries, true, "dailyShippedBooks");
  let libIndex = 0;
  let remainDays = totalNbDays;
  while(remainDays > allLibraries[libIndex].signupTime) {
    const scannedLib = allLibraries[libIndex];
    if (scannedLib.scan(remainDays)) {
      allScannedLibraries.push(scannedLib);
      remainDays -= allLibraries[libIndex].signupTime;
      if (allLibraries.length === libIndex) {
        break;
      }
    };
    libIndex++;
  }
  // console.log(allScannedLibraries);
  // printOutput(outputPath, allScannedLibraries);
}

/**
 * Find the solution - 02
 * - based on max score
 */
const findSolutionMaxScore =  () => {

  for (let index = 0; index < allLibraries.length; index++) {
    allLibraries[index].getMaxScore(totalNbDays);
  }
  let remainLibs = allLibraries.filter(l => l.maxScores > 0 && !l.signed);
  // quickSort(remainLibs, false, "signupTime");
  quickSort(remainLibs, true, "maxScores");
  let remainDays = totalNbDays;
  while (remainLibs.length) {
    const scannedLib = remainLibs[0];
    if (scannedLib.scan(remainDays)) {
      allScannedLibraries.push(scannedLib);
      remainDays -= remainLibs[0].signupTime;
      // Recalculate max score
      for (let index = 0; index < remainLibs.length; index++) {
        remainLibs[index].getMaxScore(remainDays);
      }
      remainLibs = remainLibs.filter(l => l.maxScores > 0 && !l.signed);
      // quickSort(remainLibs, false, "signupTime");
      quickSort(remainLibs, true, "maxScores");
    }
  }
  // console.log(allScannedLibraries);
}

/**
 * Process at the end of the input file
 */
const endProcessFct = () => {
  console.log('Finish reading input file');
  // console.log(totalNbBooks);
  // console.log(totalNbLibs);
  // console.log(totalNbDays);
  // console.log(allBooks);
  // console.log(allLibraries);
  // findSolutionSignupTime();
  quickSort(allLibraries, false, "signupTime");
  findSolutionMaxScore();
  // findSolutionNumberOfBooks();
  // findSolutionRandom();
  // findSolutionDailyShippedBooks();
  // printOutput(outputPath, listOutput, outputProcessFct,' ');
  printOutput(outputPath, allScannedLibraries);
}

// START APPLICATION
if (process.argv.length < 3) {
  console.error('MISSING ARGUMENT!');
  process.exit(1);
}
// Parse arguments
// CONFIG INTPUT and OUTPUT
const dataPath = process.argv[2];
const inputArrayPaths = dataPath.split('/');
const outputPath = `${inputArrayPaths[inputArrayPaths.length - 1]}_${Date.now()}.txt`;
console.log('Input data: ', dataPath);
console.log('Output will be: ', outputPath);
processInputFile(dataPath, lineProcessFct, endProcessFct);
