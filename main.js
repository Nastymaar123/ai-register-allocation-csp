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
*/



"use strict";

const fs = require('fs');
const { parseGraph } = require("./graph");
const { backtrackNaive, backtrackMAC } = require("./solver");

function main() {

    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error("Usage: node main.js <input_file>");
        process.exit(1);
    }

    const algorithm = args[0];
    const inputFile = args[1];
    const outputFile = args[2];
    const resultFile = args[3];

    if (algorithm !== "backtrack-naive" && algorithm !== "backtrack-mac") {
        console.log("Error: Invalid algorithm. Use 'backtrack-naive' or 'backtrack-mac'.");
        process.exit(1);
    }

    const graph = parseGraph(inputFile);

    let result;

    if (algorithm === "backtrack-naive") {

        result = backtrackNaive(graph.virtualRegisters, graph.interferenceGraph);
    }
    else if (algorithm === "backtrack-mac") {
        result = backtrackMAC(graph.virtualRegisters, graph.interferenceGraph);
    }

    let output = "";

    if (result.solveStatus === "SAT") {

        const variables = Object.keys(result.assignment).sort();
        for (const variable of variables) {
            output += `${variable} = ${result.assignment[variable]}\n`;
        }
    }
    fs.writeFileSync(outputFile, output);

    const csvLine = algorithm + "," + result.nodesVisited + "," + result.backtracks + "," + result.ac3Revisions + "," + result.solveStatus + "\n";
    fs.writeFileSync(resultFile, csvLine);
}

main();
