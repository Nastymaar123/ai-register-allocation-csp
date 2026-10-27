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
*/



"use strict";

const { parseGraph } = require('./graph');

function isValidAssignment(variable, register, assignment, interferenceGraph) {

    const neighbors = interferenceGraph[variable] || [];
    
    for (const neighbor of neighbors) {
        if (assignment[neighbor] === register) {
            return false;
        }
    }
    return true;
}

function backtrackNaive(virtualRegisters, interferenceGraph) {

    const assignment = {};

    const variables = Object.keys(virtualRegisters).sort();

    let nodesVisited = 0;
    let backtracks = 0;

    function backtrack(index) {

        if (index === variables.length) {
            return true;
        }

        const variable = variables[index];
        const domain = [...virtualRegisters[variable]].sort();

        for (const register of domain) {

            nodesVisited++;
            if (isValidAssignment(variable, register, assignment, interferenceGraph)) {
                assignment[variable] = register;
                if (backtrack(index + 1)) {
                    return true;
                }
                delete assignment[variable];
            }
        }

        backtracks++;
        return false;
    }

    const solved = backtrack(0);
    return {
        assignment: solved ? assignment : null,
        nodesVisited,
        backtracks,
        ac3Revisions: 0,
        solveStatus: solved ? "SAT" : "UNSAT"
    };
 
}

module.exports = {
    backtrackNaive
};
