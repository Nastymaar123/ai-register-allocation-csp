/*
Maar Drew-Joseph
CPSC 447, Fall 2026
Professor Schwesinger
Project 4 - Constraint Satisfaction
Created: 10/23/2026
Due Date: 11/08/2026
Major: Information Technology
File: graph.js
Purpose: Parses a graph file containing physical registers, virtual registers, and interferences, and returns the parsed data structures.

References:

* OpenAI. (2026). ChatGPT. https://chatgpt.com/
* ChatGPT was used to assist with understanding
* programming concepts, implementing and debugging
* functions, and reviewing code for correctness.
* 
* MDN Web Docs. Array.prototype.push().
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
*
* Used as a reference for adding elements
* to arrays using the push() method.
* 
*/

"use strict";

// Import the file system module for reading graph files
const fs = require('fs');

// name: parseGraph
// purpose: Parses a graph file containing physical registers, virtual registers, and interferences, and returns the parsed data structures.
// parameters: inputFile - the path to the graph file to be parsed.
// Returns: An object containing physicalRegisters, virtualRegisters, and interferenceGraph.

function parseGraph(inputFile) {

    // Read the contents of the input graph file
    const data = fs.readFileSync(inputFile, 'utf8');

    // Split the file contents into lines for processing
    const lines = data.split(/\r?\n/);

    // Initialize data structures for storing parsed graph information
    const physicalRegisters = [];
    const virtualRegisters = {};
    const interferenceGraph = {};
    
    let currentSection = ""; // Tracks the current section of the graph file being parsed

    // Iterate through each line of the graph file and parse based on the current section
    for (const line of lines) {

        // Trim the current line to remove leading and trailing whitespace
        const trimmedLine = line.trim();

        // Skip empty lines to avoid processing them
        if (trimmedLine === "") {
            continue;
        } 

        // Check if the line indicates the start of the physical registers section
        if (trimmedLine.startsWith("PHYSICAL_REGISTERS")) {
            currentSection = "physical";
            
            const parts = trimmedLine.split(/\s+/);

            physicalRegisters.push(...parts.slice(1));
        }

        // Check if the line indicates the start of the virtual registers section
        else if (trimmedLine === "VIRTUAL_REGISTERS") {
            currentSection = "virtual";
        
        }
        
        else if (trimmedLine === "INTERFERENCES") {
            // Check if the line indicates the start of the interferences section
            currentSection = "interferences";

        }

        // Parse virtual registers and their allowed physical registers
        else if (currentSection === "virtual") {
            const parts = trimmedLine.split(/\s+/);

            const registerName = parts[0];

            const allowedRegisters = parts.slice(1);

            virtualRegisters[registerName] = allowedRegisters;
        }
        else if (currentSection === "interferences") {
            // Parse interferences between registers
            const parts = trimmedLine.split(/\s+/);

            const register1 = parts[0]; // First register in the interference pair
            const register2 = parts[1]; // Second register in the interference pair 

            if (!interferenceGraph[register1]) {
                interferenceGraph[register1] = [];
            }
            if (!interferenceGraph[register2]) {
                interferenceGraph[register2] = [];
            }

            interferenceGraph[register1].push(register2);
            interferenceGraph[register2].push(register1);
        }
    
    }

    return {
        physicalRegisters,
        virtualRegisters,
        interferenceGraph
    };
}

module.exports =  { parseGraph };