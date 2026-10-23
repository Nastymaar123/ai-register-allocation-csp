"use strict";

const fs = require('fs');

function parseGraph(inputFile) {

    const data = fs.readFileSync(inputFile, 'utf8');

    const lines = data.split(/\r?\n/);

    const physicalRegisters = [];
    const virtualRegisters = {};
    const interferenceGraph = {};
    
    let currentSection = "";

    for (const line of lines) {

        const trimmedLine = line.trim();

        if (trimmedLine === "") {
            continue;
        }

        if (trimmedLine.startsWith("PHYSICAL_REGISTERS")) {
            currentSection = "physical";
            
            const parts = trimmedLine.split(/\s+/);

            physicalRegisters.push(...parts.slice(1));
        }

        else if (trimmedLine === "VIRTUAL_REGISTERS") {
            currentSection = "virtual";
        
        }
        
        else if (trimmedLine === "INTERFERENCES") {
            currentSection = "interferences";

        }

        else if (currentSection === "virtual") {
            const parts = trimmedLine.split(/\s+/);

            const registerName = parts[0];

            const allowedRegisters = parts.slice(1);

            virtualRegisters[registerName] = allowedRegisters;
        }
        else if (currentSection === "interferences") {
            const parts = trimmedLine.split(/\s+/);

            const register1 = parts[0];
            const register2 = parts[1];

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