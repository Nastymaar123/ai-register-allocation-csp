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
*/


"use strict";

function ac3(domains, interferenceGraph) {

    const queue = [];

    let revisions = 0;

    const variables = Object.keys(interferenceGraph).sort();

    for (const variable of variables) {

        const neighbors = [ ...interferenceGraph[variable]].sort();

        for (const neighbor of neighbors) {
            queue.push([variable, neighbor]);
        }

    }

    while (queue.length > 0) {
        const [variable1, variable2] = queue.shift();
        
        revisions++;

        if (revise(domains, variable1, variable2)) {
            
            if (domains[variable1].length === 0) {
                return {
                    consistent: false,
                    revisions
                };
            }
        const neighbors = [ ...(interferenceGraph[variable1] || [])].sort();
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
        

function revise(domains, variable1, variable2) {

    let revised = false;

    const domain1 = domains[variable1];
    const domain2 = domains[variable2];

    for (const register of [ ...domain1]) {

        const supported = domain2.some(otherRegister => register !== otherRegister);

        if (!supported) {

            const index = domain1.indexOf(register);
            domain1.splice(index, 1);
            revised = true;
        }

    }

    return revised;
}

module.exports = { ac3 };