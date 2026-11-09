/*
Maar Drew-Joseph
CPSC 447, Fall 2026
Professor Schwesinger
Project 4 - Constraint Satisfaction
Created: 11/07/2026
Due Date: 11/08/2026
Major: Information Technology
File: run_benchmark.js
Purpose: Run benchmarks for different graph sizes, register budgets, and densities using specified algorithms and save the results to a CSV file.

References:

* OpenAI. (2026). ChatGPT. https://chatgpt.com/
* ChatGPT was used to assist with understanding
* programming concepts, implementing and debugging
* functions, and reviewing code for correctness.
* 
*/


"use strict";

// Import required modules and define benchmark parameters
const fs = require('fs');

const { spawnSync } = require('child_process');

const { parseGraph } = require("./graph");

const { backtrackNaive, backtrackMAC } = require("./solver");

const graphSizes = [10]; // List of graph sizes to benchmark

const registerBudgets = [2, 4, 8]; // List of register budgets to benchmark    

const densities = [20, 50, 80]; // List of graph densities to benchmark

const algorithms = ["backtrack-naive", "backtrack-mac"]; // List of algorithms to benchmark

const benchmarkFiles = []; // Array to hold the benchmark files that exist

// Check for the existence of benchmark files for each combination of graph size, register budget, and density
for (const sizes of graphSizes) {
    for (const registers of registerBudgets) {

        for (const density of densities) {

            const filename = `benchmark_${sizes}_${registers}_${density}.txt`;

            if (fs.existsSync(filename)) {
                benchmarkFiles.push(filename);
            }else {
                console.warn(`Benchmark file not found: ${filename}`);
            }
        }
    }
}

console.log("Benchmark files found: " + benchmarkFiles.length);

const benchmarkResults = []; // Array to hold the benchmark results for each combination of parameters and algorithms

const csvHeader = "graph_size, register_budget, density, algorithm," + "nodes_visited, backtracks, ac3_revisions, solve_status"; // CSV header for the benchmark results

benchmarkResults.push(csvHeader); // Add the CSV header as the first line of the benchmark results

// Process each benchmark file and run the specified algorithms on it
for (const file of benchmarkFiles) {

    const graph = parseGraph(file); // Parse the graph from the benchmark file

    const parts = file.replace(".txt", "").split("_"); // Extract the parts of the filename to get graph size, register budget, and density
    
    // Extract the graph size, register budget, and density from the filename parts
    const size = parts[1];
    const registers = parts[2];
    const density = parts[3];

    // Run each algorithm on the parsed graph and record the results
    for (const algorithm of algorithms) {

        const worker = spawnSync(
    process.execPath,
    ["benchmark_worker.js", algorithm, file],
    {
        encoding: "utf8",
        timeout: 30000
    }
);

        // Check if the worker process encountered an error or timed out
if (worker.error || worker.status !== 0) {

    const status = worker.error?.code === "ETIMEDOUT"
        ? "TIMEOUT"
        : "ERROR"; // Determine the status based on the worker error or timeout

    const csvLine = [
        size,
        registers,
        density,
        algorithm,
        "",
        "",
        "",
        status
    ].join(","); // Create the CSV line for the error or timeout case

    benchmarkResults.push(csvLine); // Add the CSV line for the error or timeout case to the benchmark results array

    console.log(`Benchmark ${status}: ${file} | ${algorithm}`);

    continue;
}

// Parse the JSON output from the worker process to get the benchmark result
const result = JSON.parse(worker.stdout);

        const csvLine = [
            size,
            registers,
            density,
            algorithm,
            result.nodesVisited,
            result.backtracks,
            result.ac3Revisions,
            result.solveStatus
        ].join(",");

        benchmarkResults.push(csvLine);

        console.log(`Benchmark result for ${file} with algorithm ${algorithm}: ${csvLine}`);
    }
}

const outputFile = "benchmark_results.csv"; // Define the output CSV file for the combined benchmark results

fs.writeFileSync(outputFile, benchmarkResults.join("\n") + "\n"); // Write the benchmark results to the output CSV file

console.log(`Benchmark results written to ${outputFile}`); // Log a message indicating that the benchmark results have been written to the output file