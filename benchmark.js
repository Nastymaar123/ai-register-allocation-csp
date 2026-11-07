/*
Maar Drew-Joseph
CPSC 447, Fall 2026
Professor Schwesinger
Project 4 - Constraint Satisfaction
Created: 11/07/2026
Due Date: 11/08/2026
Major: Information Technology
File: benchmark.js
Purpose: Generate benchmark files for different graph sizes, register budgets, and densities.
*/


"use strict";

const fs = require('fs');
const path = require('path');

const graphSizes = [10, 25, 50, 100];

const registerBudgets = [2, 4, 8];

const densities = [0.2, 0.5, 0.8];

const output = "benchmark_results.csv";

fs.writeFileSync(output, "graphSize,registerBudget,density,algorithm,nodesVisited,backtracks,ac3Revisions,solveStatus\n");

function generateVirtualRegisters(numVariables, numRegisters) {
   
    const physicalRegisters = [];
    const virtualRegisters = [];

    for (let i = 0; i < numRegisters; i++) {
        physicalRegisters.push("r" + i);
    }

for (let i = 0; i < numVariables; i++) {

    const variable = "v" + i;

    const domain = [...physicalRegisters];

    virtualRegisters.push({ name: variable, domain: domain });
}

    return { physicalRegisters, virtualRegisters };
}

function generateInterferences(numVariables, density) {
    const interferences = [];

    for (let i = 0; i < numVariables; i++) {
        for (let j = i + 1; j < numVariables; j++) {
            if (Math.random() < density) {
                interferences.push(["v" + i, "v" + j]);
            }
        }
    }

    return interferences;
}

function generateBenchmark(numVariables, numRegisters, density) {

    const graph = generateVirtualRegisters(numVariables, numRegisters);
    const interferences = generateInterferences(numVariables, density);


    let content = "PHYSICAL_REGISTERS ";
    content += graph.physicalRegisters.join(" ") + "\n\n";

    content += "VIRTUAL_REGISTERS\n";

    for (const variable of graph.virtualRegisters) {
        content += variable.name + " " + variable.domain.join(" ") + "\n";
    }

    content += "INTERFERENCES\n";
    for (const interference of interferences) {
        content += interference.join(" ") + "\n";
    }

    return content;


}

for (const size of graphSizes) {
    for (const registers of registerBudgets) {
        for (const density of densities) {

                const content = generateBenchmark(size, registers, density);

            const densityLabel = Math.round(density * 100);
            const filename = `benchmark_${size}_${registers}_${densityLabel}.txt`;
            fs.writeFileSync(filename, content);
            console.log(`Generated benchmark: ${filename}`);
        }
    }
}