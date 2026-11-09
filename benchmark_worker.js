/*
Maar Drew-Joseph
CPSC 447, Fall 2026
Professor Schwesinger
Project 4 - Constraint Satisfaction
Created: 11/07/2026
Due Date: 11/08/2026
Major: Information Technology
File: benchmark_worker.js
Purpose: Execute a specified algorithm on a given benchmark file and output the results as JSON.

References:

* OpenAI. (2026). ChatGPT. https://chatgpt.com/
* ChatGPT was used to assist with understanding
* programming concepts, implementing and debugging
* functions, and reviewing code for correctness.
* 
*/


"use strict";

const { parseGraph } = require("./graph"); // Import the parseGraph function from the graph module

const { backtrackNaive, backtrackMAC } = require("./solver"); // Import the backtracking algorithms from the solver module

const algorithm = process.argv[2]; // Get the algorithm name from the command-line arguments
const filename = process.argv[3]; // Get the benchmark filename from the command-line arguments

const graph = parseGraph(filename); // Parse the benchmark file to obtain the interference graph and virtual registers

let result;

if (algorithm === "backtrack-naive") { // Execute the naive backtracking algorithm

    result = backtrackNaive(
        graph.virtualRegisters,
        graph.interferenceGraph
    );

} else if (algorithm === "backtrack-mac") { // Execute the MAC-enhanced backtracking algorithm

    result = backtrackMAC(
        graph.virtualRegisters,
        graph.interferenceGraph
    );

} else {

    console.error("Unknown algorithm: " + algorithm);
    process.exit(1);
}

console.log(JSON.stringify(result));