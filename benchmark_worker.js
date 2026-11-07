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
*/


"use strict";

const { parseGraph } = require("./graph");

const { backtrackNaive, backtrackMAC } = require("./solver");

const algorithm = process.argv[2];
const filename = process.argv[3];

const graph = parseGraph(filename);

let result;

if (algorithm === "backtrack-naive") {

    result = backtrackNaive(
        graph.virtualRegisters,
        graph.interferenceGraph
    );

} else if (algorithm === "backtrack-mac") {

    result = backtrackMAC(
        graph.virtualRegisters,
        graph.interferenceGraph
    );

} else {

    console.error("Unknown algorithm: " + algorithm);
    process.exit(1);
}

console.log(JSON.stringify(result));