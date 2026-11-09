/*
Maar Drew-Joseph
CPSC 447, Fall 2026
Professor Schwesinger
Project 4 - Constraint Satisfaction
Created: 10/27/2026
Due Date: 11/08/2026
Major: Information Technology
File: solver.js
Purpose: Implements a naive backtracking solver for the constraint satisfaction problem of register allocation.

References:

* OpenAI. (2026). ChatGPT. https://chatgpt.com/
* ChatGPT was used to assist with understanding
* programming concepts, implementing and debugging
* functions, and reviewing code for correctness.
* 

*/




"use strict";

// Import required modules for graph parsing and constraint propagation
const { parseGraph } = require('./graph');
const { ac3 } = require('./ac3');
const { register } = require('node:module');

// name: isValidAssignment
// Checks if assigning a register to a variable is valid given the current assignment and interference graph
// Parameters:
// - variable: the variable to assign a register to
// - register: the register to assign
// - assignment: the current assignment of registers to variables
// - interferenceGraph: the interference graph representing conflicts between variables
// Returns: true if the assignment is valid, false otherwise

function isValidAssignment(variable, register, assignment, interferenceGraph) {

    const neighbors = interferenceGraph[variable] || []; // Get the neighbors of the variable from the interference graph
    
    // Iterate over the neighbors to check for conflicts with the current assignment
    for (const neighbor of neighbors) {
        if (assignment[neighbor] === register) {
            return false;
        }
    }
    return true; // No conflicts found, the assignment is valid
}

// name: backtrackNaive
// Implements a naive backtracking solver for the constraint satisfaction problem of register allocation
// Parameters:
// - virtualRegisters: an object mapping variables to their available registers
// - interferenceGraph: the interference graph representing conflicts between variables
// Returns: an object containing the assignment, nodes visited, backtracks, AC-3 revisions, and solve status

function backtrackNaive(virtualRegisters, interferenceGraph) {

    const assignment = {}; // Initialize the assignment object to store variable-register mappings

    const variables = Object.keys(virtualRegisters).sort(); // Get the list of variables to assign registers to, sorted for consistency

    let nodesVisited = 0; // Counter for the number of nodes visited during backtracking
    let backtracks = 0; // Counter for the number of backtracks during backtracking

    // name: backtrack
    // Recursive helper function for the naive backtracking solver
    // Parameters:
    // - index: the current index of the variable to assign
    // Returns: true if a valid assignment is found, false otherwise
    function backtrack(index) {

        // Base case: all variables have been assigned
        if (index === variables.length) {
            return true; 
        }

        const variable = variables[index];
        const domain = [...virtualRegisters[variable]].sort();

        for (const register of domain) {

            nodesVisited++;
            // Check if assigning the current register to the variable is valid
            if (isValidAssignment(variable, register, assignment, interferenceGraph)) {
                assignment[variable] = register; // Assign the register to the variable
                if (backtrack(index + 1)) {
                    return true; // Valid assignment found for the next variable
                }
                delete assignment[variable]; // Backtrack: remove the assignment
            }
        }

        backtracks++; // Increment the backtrack counter as no valid assignment was found for this variable
        return false; // No valid assignment found, backtrack to the previous variable
    }

    // Start the backtracking process from the first variable
    const solved = backtrack(0);
    return {
        assignment: solved ? assignment : null,
        nodesVisited,
        backtracks,
        ac3Revisions: 0,
        solveStatus: solved ? "SAT" : "UNSAT"
    };
 
}

// name: selectVariableMRV
// Selects the next variable to assign using the Minimum Remaining Values (MRV) heuristic
// Parameters:
// - domains: an object mapping variables to their available registers
// - assignment: the current assignment of variables to registers
// - interferenceGraph: the interference graph representing conflicts between variables
// Returns: the variable with the fewest remaining values, breaking ties using the degree heuristic and lexicographic order

function selectVariableMRV(domains, assignment, interferenceGraph) {

    const unassignedVariables = Object.keys(domains).filter(variable => assignment[variable] === undefined); // Get the list of unassigned variables

    unassignedVariables.sort((a, b) => {
        // Sort unassigned variables based on MRV, degree heuristic, and lexicographic order

        const domainDifference = domains[a].length - domains[b].length; // Compare based on the size of the domain

        if (domainDifference !== 0) {
            return domainDifference;
        }

        const degreeA = (interferenceGraph[a] || []).filter(neighbor => assignment[neighbor] === undefined).length; // Count unassigned neighbors

        const degreeB = (interferenceGraph[b] || []).filter(neighbor => assignment[neighbor] === undefined).length; // Count unassigned neighbors

        if (degreeA !== degreeB) {
            return degreeB - degreeA; // Prefer variables with higher degree
        }

        return a.localeCompare(b);
    });

    return unassignedVariables[0];


}

// name: selectValueLCV
// Selects the order of values for a variable using the Least Constraining Value (LCV) heuristic
// Parameters:
// - variable: the variable to assign a register to
// - domains: an object mapping variables to their available registers
// - assignment: the current assignment of variables to registers
// - interferenceGraph: the interference graph representing conflicts between variables
// Returns: an array of values sorted by the least constraining value heuristic

function selectValueLCV(variable, domains, assignment, interferenceGraph) {

    const neighbors = interferenceGraph[variable] || []; // Get the neighbors of the variable in the interference graph

    const values = [...domains[variable]]; // Copy the domain values for sorting

    values.sort((a, b) => { // Sort values based on LCV heuristic

        const countConflicts = (register) => { // Count conflicts for a given register

            let conflicts = 0;

            for (const neighbor of neighbors) { // Iterate over neighbors
                if (assignment[neighbor] === register) {

                    if (domains[neighbor].includes(register)) {
                        conflicts++; // Increment conflicts if neighbor can take the same register
                    }

                }
            }
            return conflicts; // Return the total conflicts for this register
        };

        const conflictsA = countConflicts(a); // Count conflicts for value a
        const conflictsB = countConflicts(b); // Count conflicts for value b

        if (conflictsA !== conflictsB) {
            return conflictsA - conflictsB; // Prefer values with fewer conflicts
        }

        return a.localeCompare(b); // Tie-breaker: lexicographical order
    });
    
    return values;

}

// name: backtrackMAC
// Solves the register allocation problem using backtracking with MAC (Maintaining Arc Consistency)
// Parameters:
// - virtualRegisters: an object mapping variables to their available registers
// - interferenceGraph: the interference graph representing conflicts between variables
// Returns: an object containing the assignment, nodes visited, backtracks, AC3 revisions, and solve status

function backtrackMAC(virtualRegisters, interferenceGraph) {

    const assignment = {}; // Stores the current assignment of variables to registers

    const domains = {}; // Stores the current domains of the variables

    let nodesVisited = 0; // Counter for the number of nodes visited during backtracking
    let backtracks = 0; // Counter for the number of backtracks performed
    let ac3Revisions = 0; // Counter for the number of AC3 revisions made

    // Initialize the domains for each variable based on the available registers
    for (const variable of Object.keys(virtualRegisters).sort()) {
        domains[variable] = [...virtualRegisters[variable]].sort();
    }

    // Perform initial AC3 to prune the domains before starting backtracking
    const initialAC3 = ac3(domains, interferenceGraph);
    ac3Revisions += initialAC3.revisions;

    // If the initial AC3 step finds inconsistency, return UNSAT immediately
    if (!initialAC3.consistent) {
        return {
            assignment: null,
            nodesVisited,
            backtracks,
            ac3Revisions,
            solveStatus: "UNSAT"
        };
    }

    // name: backtrack
    // Recursive helper function for backtracking with MAC
    // Parameters:
    // - currentDomains: the current domains of the variables
    // Returns: true if a solution is found, false otherwise
    function backtrack(currentDomains) {

        // Check if all variables have been assigned
        // If so, a solution has been found
    if (Object.keys(assignment).length === Object.keys(virtualRegisters).length) {
        return true;
    }

    const variable = selectVariableMRV(currentDomains, assignment, interferenceGraph); // Select the next variable using MRV heuristic

    const orderValues = selectValueLCV(variable, currentDomains, assignment, interferenceGraph); // Order the values using LCV heuristic



    // Try each value in the order determined by LCV
    for (const register of orderValues) {

    nodesVisited++;

        // Check if assigning the register to the variable is valid
        if (!isValidAssignment(variable, register, assignment, interferenceGraph)) {
            continue;
        }

        // Assign the register to the variable
    assignment[variable] = register;

        // Create a copy of the current domains for the next recursive call
    const newDomains = {};

    // Copy the current domains to the new domains object
    for (const varName of Object.keys(currentDomains)) {
        newDomains[varName] = [...currentDomains[varName]];
    }
    
    newDomains[variable] = [register]; // Restrict the domain of the variable to the assigned register

        // Perform AC3 on the new domains to enforce arc consistency
        const result = ac3(newDomains, interferenceGraph);
        ac3Revisions += result.revisions;

        // If AC3 maintains consistency, proceed with the recursive backtracking call
    if (result.consistent) {
        if (backtrack(newDomains)) {
            return true;
        }
    }

    delete assignment[variable]; // Backtrack by removing the assignment for the variable

}

    // Increment the backtrack counter and return false to indicate failure
    backtracks++;
    return false;

}

// Start the backtracking search with the initial domains

const solved = backtrack(domains);

return {
    assignment: solved ? assignment : null,
    nodesVisited,
    backtracks,
    ac3Revisions,
    solveStatus: solved ? "SAT" : "UNSAT"
};

}

module.exports = {
    backtrackNaive,
    backtrackMAC
};
