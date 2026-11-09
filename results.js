/*
Maar Drew-Joseph
CPSC 447, Fall 2026
Professor Schwesinger
Project 4 - Constraint Satisfaction
Created: 11/07/2026
Due Date: 11/08/2026
Major: Information Technology
File: results.js
Purpose: Combines individual benchmark result CSV files into a single CSV file for easier analysis.

References:

* OpenAI. (2026). ChatGPT. https://chatgpt.com/
* ChatGPT was used to assist with understanding
* programming concepts, implementing and debugging
* functions, and reviewing code for correctness.
*
*/

"use strict";

// Import required modules and define input files for combining benchmark results
const fs = require("fs");

// List of individual benchmark result CSV files to combine
const files = [
    "benchmark_results_10.csv",
    "benchmark_results_25.csv",
    "benchmark_results_50.csv",
    "benchmark_results_100.csv"
];

// Array to hold the combined results from all files
const combinedResults = [];

// Read each file and combine its contents
for (const file of files) {

    const lines = fs.readFileSync(file, "utf8") .trim().split(/\r?\n/);

    // If this is the first file, include the header line
    if (combinedResults.length === 0) {
        combinedResults.push(lines[0]);
    }

    // Append the data lines (excluding the header) to the combined results
    combinedResults.push(...lines.slice(1));
}

// Write the combined results to the output CSV file
// The output file will include the header from the first file and all data lines from all files
fs.writeFileSync(
    "benchmark_results_all.csv",
    combinedResults.join("\n") + "\n"
);

console.log("Combined benchmark results saved.");