/*
Maar Drew-Joseph
CPSC 447, Fall 2026
Professor Schwesinger
Project 4 - Constraint Satisfaction
Created: 11/07/2026
Due Date: 11/08/2026
Major: Information Technology
File: main.js
Purpose: Main entry point for the register allocation constraint satisfaction project. Handles command-line arguments, invokes the appropriate solver, and writes the results to output files.

References:

* OpenAI. (2026). ChatGPT. https://chatgpt.com/
* ChatGPT was used to assist with understanding
* programming concepts, implementing and debugging
* functions, and reviewing code for correctness.
*/



"use strict";

// Import required modules and functions
const fs = require('fs');
const { parseGraph } = require("./graph");
const { backtrackNaive, backtrackMAC } = require("./solver");

// name: main
// purpose: Main entry point for the register allocation constraint satisfaction project. Handles command-line arguments, invokes the appropriate solver, and writes the results to output files.
// parameters: None
// Returns: None
function main() {

    const args = process.argv.slice(2); // Get command-line arguments excluding "node" and "main.js"

    if (args.length < 1) { // Check if there are enough command-line arguments
        console.error("Usage: node main.js <input_file>");
        process.exit(1);
    }

    const algorithm = args[0]; // Get the algorithm from the command-line arguments
    const inputFile = args[1]; // Get the input file from the command-line arguments
    const outputFile = args[2]; // Get the output file from the command-line arguments
    const resultFile = args[3]; // Get the result file from the command-line arguments

    // Validate the algorithm argument
    if (algorithm !== "backtrack-naive" && algorithm !== "backtrack-mac") {
        console.log("Error: Invalid algorithm. Use 'backtrack-naive' or 'backtrack-mac'.");
        process.exit(1);
    }

    // Parse the input graph from the input file
    const graph = parseGraph(inputFile);

    // Solve the register allocation problem using the specified algorithm
    let result;

    // Choose the appropriate solver based on the algorithm argument
    if (algorithm === "backtrack-naive") {

        result = backtrackNaive(graph.virtualRegisters, graph.interferenceGraph);
    }
    // If the algorithm is not recognized, print an error and exit
    else if (algorithm === "backtrack-mac") {
        result = backtrackMAC(graph.virtualRegisters, graph.interferenceGraph);
    }

    let output = ""; // Initialize the output string for the assignment results

    // Check if the result indicates a satisfiable assignment
    if (result.solveStatus === "SAT") {

        const variables = Object.keys(result.assignment).sort();
        for (const variable of variables) {
            output += `${variable} = ${result.assignment[variable]}\n`;
        }
    }
    // Write the assignment output to the output file
    // If the result is unsatisfiable, the output will be empty
    fs.writeFileSync(outputFile, output);

    const csvLine = algorithm + "," + result.nodesVisited + "," + result.backtracks + "," + result.ac3Revisions + "," + result.solveStatus + "\n";
    fs.writeFileSync(resultFile, csvLine);
}

main();
