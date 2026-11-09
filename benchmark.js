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

References:

* OpenAI. (2026). ChatGPT. https://chatgpt.com/
* ChatGPT was used to assist with understanding
* programming concepts, implementing and debugging
* functions, and reviewing code for correctness.
* 
*/


"use strict";

const fs = require('fs'); // Import the file system module for reading and writing files
const path = require('path'); // Import the path module for handling file paths

const graphSizes = [10, 25, 50, 100]; // Different sizes of graphs to generate benchmarks for

const registerBudgets = [2, 4, 8]; // Different register budgets to generate benchmarks for

const densities = [0.2, 0.5, 0.8]; // Different graph densities to generate benchmarks for

const output = "benchmark_results.csv"; // Output CSV file for storing benchmark results

fs.writeFileSync(output, "graphSize,registerBudget,density,algorithm,nodesVisited,backtracks,ac3Revisions,solveStatus\n"); // Write CSV header to the output file

// name: generateVirtualRegisters
// purpose: Generate virtual registers and their domains based on the number of variables and physical registers.
// parameters: numVariables - the number of virtual registers to generate.
//             numRegisters - the number of physical registers available.
// Returns: An object containing the physical registers and the virtual registers with their domains.
function generateVirtualRegisters(numVariables, numRegisters) {
   
    const physicalRegisters = []; // Array to store physical registers
    const virtualRegisters = []; // Array to store virtual registers

    // Generate the list of physical registers
    for (let i = 0; i < numRegisters; i++) {
        physicalRegisters.push("r" + i);
    }

    for (let i = 0; i < numVariables; i++) { // Generate each virtual register

    const variable = "v" + i;

        const domain = [...physicalRegisters]; // Each virtual register can use any physical register

        virtualRegisters.push({ name: variable, domain: domain }); // Add the virtual register with its domain to the array
    }

    return { physicalRegisters, virtualRegisters };
}

// name: generateInterferences
// purpose: Generate interference pairs between virtual registers based on the graph density.
// parameters: numVariables - the number of virtual registers.
//             density - the probability of an interference between any two virtual registers.
// Returns: An array of interference pairs.
function generateInterferences(numVariables, density) {
    const interferences = [];

    // Generate interference pairs between virtual registers based on the graph density
    for (let i = 0; i < numVariables; i++) {
        for (let j = i + 1; j < numVariables; j++) {
            if (Math.random() < density) {
                interferences.push(["v" + i, "v" + j]);
            }
        }
    }

    return interferences;
}

// name: generateBenchmark
// purpose: Generate the content of a benchmark file based on the number of variables, registers, and graph density.
// parameters: numVariables - the number of virtual registers.
//             numRegisters - the number of physical registers available.
//             density - the probability of an interference between any two virtual registers.
// Returns: A string representing the content of the benchmark file.
function generateBenchmark(numVariables, numRegisters, density) {

    const graph = generateVirtualRegisters(numVariables, numRegisters); // Generate the virtual registers and their domains
    const interferences = generateInterferences(numVariables, density); // Generate the interference pairs based on the graph density


    let content = "PHYSICAL_REGISTERS "; // Add the physical registers section to the content
    content += graph.physicalRegisters.join(" ") + "\n\n";

    content += "VIRTUAL_REGISTERS\n"; // Add the virtual registers section to the content

    for (const variable of graph.virtualRegisters) { // Add each virtual register and its domain to the content
        content += variable.name + " " + variable.domain.join(" ") + "\n";
    }

    content += "INTERFERENCES\n"; // Add the interferences section to the content
    for (const interference of interferences) { // Add each interference pair to the content
        content += interference.join(" ") + "\n";
    }

    return content;


}

// Generate benchmark files for different graph sizes, register budgets, and densities
for (const size of graphSizes) { // Iterate over each graph size
    for (const registers of registerBudgets) { // Iterate over each register budget
        for (const density of densities) { // Iterate over each density

                const content = generateBenchmark(size, registers, density); // Generate the benchmark content for the current combination of size, registers, and density

            const densityLabel = Math.round(density * 100);
            const filename = `benchmark_${size}_${registers}_${densityLabel}.txt`;
            fs.writeFileSync(filename, content);
            console.log(`Generated benchmark: ${filename}`);
        }
    }
}