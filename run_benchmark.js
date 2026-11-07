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
*/


"use strict";

const fs = require('fs');

const { spawnSync } = require('child_process');

const { parseGraph } = require("./graph");

const { backtrackNaive, backtrackMAC } = require("./solver");

const graphSizes = [10];

const registerBudgets = [2, 4, 8];

const densities = [20, 50, 80];

const algorithms = ["backtrack-naive", "backtrack-mac"];

const benchmarkFiles = [];

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

const benchmarkResults = [];

const csvHeader = "graph_size, register_budget, density, algorithm," + "nodes_visited, backtracks, ac3_revisions, solve_status";

benchmarkResults.push(csvHeader);

for (const file of benchmarkFiles) {

    const graph = parseGraph(file);

    const parts = file.replace(".txt", "").split("_");
    
    const size = parts[1];
    const registers = parts[2];
    const density = parts[3];

    for (const algorithm of algorithms) {

        const worker = spawnSync(
    process.execPath,
    ["benchmark_worker.js", algorithm, file],
    {
        encoding: "utf8",
        timeout: 30000
    }
);

if (worker.error || worker.status !== 0) {

    const status = worker.error?.code === "ETIMEDOUT"
        ? "TIMEOUT"
        : "ERROR";

    const csvLine = [
        size,
        registers,
        density,
        algorithm,
        "",
        "",
        "",
        status
    ].join(",");

    benchmarkResults.push(csvLine);

    console.log(`Benchmark ${status}: ${file} | ${algorithm}`);

    continue;
}

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

const outputFile = "benchmark_results.csv";

fs.writeFileSync(outputFile, benchmarkResults.join("\n") + "\n");

console.log(`Benchmark results written to ${outputFile}`);