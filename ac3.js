/*
Maar Drew-Joseph
CPSC 447, Fall 2026
Professor Schwesinger
Project 4 - Constraint Satisfaction
Created: 10/30/2026
Due Date: 11/08/2026
Major: Information Technology
File: ac3.js
Purpose: Implements the AC-3 algorithm for constraint satisfaction problems.

References:

* OpenAI. (2026). ChatGPT. https://chatgpt.com/
* ChatGPT was used to assist with understanding
* programming concepts, implementing and debugging
* functions, and reviewing code for correctness.
* 
* 
*/


"use strict";

// name: ac3
// purpose: Implements the AC-3 algorithm for constraint satisfaction problems.
// parameters: domains - an object mapping variables to their possible values.
//             interferenceGraph - an object representing the interference graph.
// Returns: An object containing consistent (boolean) and revisions (number).

function ac3(domains, interferenceGraph) {

    const queue = []; // Initialize the queue for storing arcs to be checked

    let revisions = 0; // Counter for the number of revisions made to the domains

    // Get the list of variables from the interference graph and sort them for consistent processing
    const variables = Object.keys(interferenceGraph).sort();

    // Initialize the queue with all arcs (variable, neighbor) from the interference graph
    for (const variable of variables) {

        const neighbors = [ ...interferenceGraph[variable]].sort(); // Get the sorted list of neighbors for the current variable

        // Add each neighbor as an arc to the queue for processing
        for (const neighbor of neighbors) {
            queue.push([variable, neighbor]);
        }

    }

    // Process the queue until it is empty, ensuring arc consistency for all variable pairs
    while (queue.length > 0) {
        const [variable1, variable2] = queue.shift();
        
        revisions++; // Increment the revision counter for each arc processed

        if (revise(domains, variable1, variable2)) { // Revise the domain of variable1 with respect to variable2
            
            if (domains[variable1].length === 0) {
                // If the domain of variable1 becomes empty, the CSP is inconsistent
                return {
                    consistent: false,
                    revisions
                };
            }
            // Add all neighbors of variable1 (except variable2) back to the queue for further processing
        const neighbors = [ ...(interferenceGraph[variable1] || [])].sort();

        // Iterate through each neighbor and add it to the queue if it is not variable2
        for (const neighbor of neighbors) {
            if (neighbor !== variable2) {
                queue.push([neighbor, variable1]);
            }
        }
        }

    }
    return {
        consistent: true,
        revisions
    };
}
        

// name: revise
// purpose: Revises the domain of variable1 with respect to variable2 to maintain arc consistency.
// parameters: domains - an object mapping variables to their possible values.
//             variable1 - the variable whose domain is to be revised.
//             variable2 - the variable used to check consistency against variable1.
// Returns: A boolean indicating whether the domain of variable1 was revised.

function revise(domains, variable1, variable2) {

    let revised = false; // Flag to indicate if the domain of variable1 was revised

    const domain1 = domains[variable1]; // Get the domain of variable1
    const domain2 = domains[variable2]; // Get the domain of variable2

    // Iterate through each value in the domain of variable1 to check for support in the domain of variable2
    for (const register of [ ...domain1]) {

        const supported = domain2.some(otherRegister => register !== otherRegister); // Check if there is a value in domain2 that is different from the current value in domain1

        // If no supporting value is found in domain2, remove the current value from domain1
        if (!supported) {

            const index = domain1.indexOf(register);
            domain1.splice(index, 1);
            revised = true;
        }

    }

    return revised;
}

module.exports = { ac3 };