"use strict";

const fs = require("fs");

const files = [
    "benchmark_results_10.csv",
    "benchmark_results_25.csv",
    "benchmark_results_50.csv",
    "benchmark_results_100.csv"
];

const combinedResults = [];

for (const file of files) {

    const lines = fs.readFileSync(file, "utf8")
        .trim()
        .split(/\r?\n/);

    if (combinedResults.length === 0) {
        combinedResults.push(lines[0]);
    }

    combinedResults.push(...lines.slice(1));
}

fs.writeFileSync(
    "benchmark_results_all.csv",
    combinedResults.join("\n") + "\n"
);

console.log("Combined benchmark results saved.");