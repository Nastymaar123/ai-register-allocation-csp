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
const { ac3 } = require('./ac3');
const { register } = require('node:module');


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

function selectVariableMRV(domains, assignment, interferenceGraph) {

    const unassignedVariables = Object.keys(domains).filter(variable => assignment[variable] === undefined);

    unassignedVariables.sort((a, b) => {

        const domainDifference = domains[a].length - domains[b].length;

        if (domainDifference !== 0) {
            return domainDifference;
        }

        const degreeA = (interferenceGraph[a] || []).filter(neighbor => assignment[neighbor] === undefined).length;

        const degreeB = (interferenceGraph[b] || []).filter(neighbor => assignment[neighbor] === undefined).length;

        if (degreeA !== degreeB) {
            return degreeB - degreeA;
        }

        return a.localeCompare(b);
    });

    return unassignedVariables[0];


}

function selectValueLCV(variable, domains, assignment, interferenceGraph) {

    const neighbors = interferenceGraph[variable] || [];

    const values = [...domains[variable]];

    values.sort((a, b) => {

        const countConflicts = (register) => {

            let conflicts = 0;

            for (const neighbor of neighbors) {
                if (assignment[neighbor] === register) {

                    if (domains[neighbor].includes(register)) {
                        conflicts++;
                    }

                }
            }
            return conflicts;
        };

        const conflictsA = countConflicts(a);
        const conflictsB = countConflicts(b);

        if (conflictsA !== conflictsB) {
            return conflictsA - conflictsB;
        }

        return a.localeCompare(b);
    });
    
    return values;

}

function backtrackMAC(virtualRegisters, interferenceGraph) {

    const assignment = {};

    const domains = {};

    let nodesVisited = 0;
    let backtracks = 0;
    let ac3Revisions = 0;

    for (const variable of Object.keys(virtualRegisters).sort()) {
        domains[variable] = [...virtualRegisters[variable]].sort();
    }

    const initialAC3 = ac3(domains, interferenceGraph);
    ac3Revisions += initialAC3.revisions;

    if (!initialAC3.consistent) {
        return {
            assignment: null,
            nodesVisited,
            backtracks,
            ac3Revisions,
            solveStatus: "UNSAT"
        };
    }

function backtrack(currentDomains) {

    if (Object.keys(assignment).length === Object.keys(virtualRegisters).length) {
        return true;
    }

    const variable = selectVariableMRV(currentDomains, assignment, interferenceGraph);

    const orderValues = selectValueLCV(variable, currentDomains, assignment, interferenceGraph);



for (const register of orderValues) {

    nodesVisited++;

    if (!isValidAssignment(variable, register, assignment, interferenceGraph)) {
        continue;
    }

    assignment[variable] = register;

    const newDomains = {};

    for (const varName of Object.keys(currentDomains)) {
        newDomains[varName] = [...currentDomains[varName]];
    }
    
    newDomains[variable] = [register];

    const result = ac3(newDomains, interferenceGraph);
    ac3Revisions += result.revisions;

    if (result.consistent) {
        if (backtrack(newDomains)) {
            return true;
        }
    }

    delete assignment[variable];

}

backtracks++;
return false;

}



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
