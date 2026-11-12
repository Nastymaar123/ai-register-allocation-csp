# CPSC 447 Project 4: Constraint Satisfaction

**Author:** Maar Drew-Joseph
**Course:** CPSC 447
**Language:** JavaScript (Node.js)

## Project Overview

This project implements a Constraint Satisfaction Problem (CSP)
solver for register allocation using JavaScript and Node.js.

The program assigns physical registers to virtual registers
while ensuring that interfering registers do not share
the same physical register.

Two search algorithms are implemented:
- Naive recursive backtracking
- Backtracking with Maintaining Arc Consistency (MAC)

The MAC solver uses AC-3 constraint propagation alongside
Minimum Remaining Values (MRV), Degree, and Least
Constraining Value (LCV) heuristics.

The project also includes automated benchmarking to compare
search efficiency across different graph sizes, interference
densities, and physical register budgets.

##  How to Run

The program supports two algorithms:

- `backtrack-naive`: Standard recursive backtracking.
- `backtrack-mac`: Backtracking with Maintaining Arc Consistency (MAC).

The command-line format is:

```bash
node main.js <algorithm> <input_file> <output_file> <result_file>
```

To execute naive backtracking:

```bash
node main.js backtrack-naive inputs/sample.txt output.txt result.csv
```

To execute MAC:

```bash
node main.js backtrack-mac inputs/sample.txt output.txt result.csv
```

The program generates two output files:

- **Assignment output:** Contains the physical register assigned to each virtual register when a valid solution exists.
- **Result CSV:** Contains the algorithm name, nodes visited, backtracks, AC-3 revisions, and SAT/UNSAT status.

### Benchmarking Instructions

The benchmark generator creates register allocation problems using:

- Virtual registers: 10, 25, 50, and 100.
- Physical register budgets: 2, 4, and 8.
- Interference densities: 20%, 50%, and 80%.

Generate benchmark inputs using:

```bash
node benchmark.js
```

Run the benchmark experiments using:

```bash
node run_benchmark.js
```

The benchmark runner executes both algorithms using separate Node.js processes and enforces a 30-second timeout per algorithm run.

The `graphSizes` array in `run_benchmark.js` determines which graph sizes are tested. To run all four sizes, set:

```javascript
const graphSizes = [10, 25, 50, 100];
```

Each completed benchmark produces performance metrics. Runs exceeding the time limit are marked `TIMEOUT`.

To combine previously saved benchmark results, use:

```bash
node results.js
```

The combined results are written to `benchmark_results_all.csv`.


##  CSP Formulation & Heuristic Design

###  Constraint Network

The register allocation problem is represented as a Constraint Satisfaction Problem (CSP) consisting of three components:

- **Variables (X):** Each virtual register represents a variable that must be assigned a physical register.
- **Domains (D):** Each virtual register has a domain containing the physical registers it is allowed to use.
- **Constraints (C):** Virtual registers that interfere with each other cannot be assigned the same physical register.

The constraint network can be represented as an undirected graph G = (V, E), where each vertex represents a virtual register and each edge represents an interference constraint.

For two interfering virtual registers, `vi` and `vj`, the binary constraint is:

\[
X_i \neq X_j
\]

A valid solution must assign one physical register to every virtual register while satisfying all interference constraints.

If no valid assignment exists, the solver returns `UNSAT`.

### AC-3 and Binary Inequality Constraints

The Maintaining Arc Consistency (MAC) algorithm uses AC-3 to remove inconsistent values from variable domains during backtracking.

For every interference edge between two virtual registers, AC-3 considers two directed arcs:

- `(Xi, Xj)`
- `(Xj, Xi)`

When revising the domain of `Xi`, a value is retained only if at least one compatible value exists in the domain of `Xj`.

Because the register allocation constraints are binary inequalities, compatibility only requires checking whether two register values are different.

This simplifies AC-3 compared to arbitrary relational constraints. The algorithm does not need to evaluate a complex relation or construct a table of allowed register combinations.

For a nonempty neighboring domain, an inequality constraint can remove a value from `Xi` only when `Xj` has a singleton domain containing that same value. If a neighboring domain becomes empty, the current assignment is inconsistent.

Whenever AC-3 removes a value from a domain, affected neighboring arcs are added back to the revision queue so consistency can be checked again.

If any variable's domain becomes empty, the current search branch fails and the solver backtracks.

### Minimum Remaining Values (MRV)

The Minimum Remaining Values heuristic selects the unassigned variable with the smallest remaining domain.

This follows the *fail-first principle*: variables with fewer available choices are more likely to expose an inconsistency early.

For example:

| Variable | Remaining Domain | Domain Size |
|---|---|---:|
| v0 | R0, R1, R2 | 3 |
| v1 | R0 | 1 |
| v2 | R1, R2 | 2 |

MRV selects `v1` because it has only one remaining value.

This reduces unnecessary exploration by prioritizing the most constrained variables.

### Degree Heuristic

The Degree heuristic is used to break ties when multiple unassigned variables have the same minimum remaining domain size.

It selects the variable with the greatest number of interference constraints involving other unassigned variables.

For example, if `v0` and `v1` both have two available physical registers, but `v0` interferes with four unassigned variables while `v1` interferes with two, the Degree heuristic selects `v0`.

Selecting highly connected variables earlier can expose conflicts sooner and reduce the number of unsuccessful search branches.

### Least Constraining Value (LCV)

The Least Constraining Value heuristic determines the order in which physical register values are attempted.

LCV prefers the value that eliminates the fewest available choices from neighboring unassigned variables.

For each candidate physical register, the solver evaluates how many neighboring domains contain that register. Values that would restrict fewer neighbors are attempted first.

For example, suppose `v0` can be assigned either `R0` or `R1`:

- Assigning `R0` would eliminate three choices across neighboring domains.
- Assigning `R1` would eliminate one choice across neighboring domains.

LCV attempts `R1` first because it preserves more flexibility for future assignments.

### Combining the Heuristics with MAC

The MAC solver combines variable ordering, value ordering, and constraint propagation.

The search process is:

1. Select an unassigned variable using MRV and Degree tie-breaking.
2. Order its available physical registers using LCV.
3. Assign a candidate physical register.
4. Run AC-3 to propagate the assignment through the interference graph.
5. If a domain becomes empty, backtrack.
6. Otherwise, continue until every virtual register is assigned.

These techniques are designed to reduce the number of explored search states compared with naive backtracking.

## 3. Search Performance Analysis

### Benchmark Configuration

The benchmark experiments evaluate how the two CSP algorithms perform under different register allocation conditions.

The experiments use the following configurations:

| Parameter | Values |
|---|---|
| Virtual Registers | 10, 25, 50, 100 |
| Physical Registers | 2, 4, 8 |
| Interference Density | 20%, 50%, 80% |
| Algorithms | Naive Backtracking, MAC |
| Timeout | 30 seconds per execution |

These configurations produce 36 benchmark graphs and 72 planned algorithm executions.

The experiments measure:

- **Nodes Visited:** Number of search nodes explored by the algorithm.
- **Backtracks:** Number of unsuccessful search decisions requiring the solver to return to an earlier state.
- **AC-3 Revisions:** Number of arc revisions performed during constraint propagation.
- **Result:** Whether the problem was satisfiable (SAT), unsatisfiable (UNSAT), or exceeded the time limit (TIMEOUT).

### Naive vs. MAC Results

The benchmark results demonstrate that MAC can significantly reduce the number of search nodes explored compared with naive backtracking.

The following results illustrate the difference:

| Virtual Registers | Physical Registers | Density | Algorithm | Nodes Visited | Backtracks | Result |
|---|---|---|---|---|---|---|
| 10 | 2 | 20% | Naive | 270 | 135 | UNSAT |
| 10 | 2 | 20% | MAC | 2 | 1 | UNSAT |
| 10 | 4 | 20% | Naive | 19 | — | SAT |
| 10 | 4 | 20% | MAC | 10 | — | SAT |
| 10 | 4 | 80% | Naive | 1,364 | — | UNSAT |
| 10 | 4 | 80% | MAC | 40 | — | UNSAT |
| 100 | 4 | 20% | Naive | 104,810,900 | 26,202,725 | UNSAT |
| 100 | 4 | 20% | MAC | 40 | 17 | UNSAT |

A dash indicates that the corresponding backtrack count was not available in the recorded summary.

For the 10-variable graph with 2 physical registers and 20% density, MAC explored 2 nodes compared with 270 nodes for naive backtracking.

For the 100-variable graph with 4 physical registers and 20% density, MAC explored only 40 nodes compared with over 104 million nodes for naive backtracking.

These examples demonstrate the effectiveness of constraint propagation in reducing unnecessary search.

### Effects of Graph Density and Register Budgets

**Graph Density**

Graph density measures how many interference edges exist relative to the maximum possible number of edges.

As density increases, virtual registers have more interference constraints, making valid register assignments more difficult to find.

For example, with 10 virtual registers and 4 physical registers:

- At 20% density, naive backtracking visited 19 nodes and found a valid assignment.
- At 80% density, naive backtracking visited 1,364 nodes and determined the problem was unsatisfiable.

MAC can detect inconsistencies earlier through AC-3, reducing the amount of search required.

**Physical Register Budgets**

The number of available physical registers affects the size of each variable's domain.

Smaller register budgets generally create more restrictive allocation problems because multiple interfering virtual registers must share fewer physical registers.

Larger register budgets provide more possible assignments but can also increase the theoretical search space.

Therefore, increasing the register budget does not always guarantee fewer search nodes.

**Graph Size**

Increasing the number of virtual registers increases the number of possible assignments exponentially in the worst case.

The benchmark experiments include graphs with up to 100 virtual registers.

For difficult instances, naive backtracking can explore extremely large search trees, while MAC may reduce the search space by detecting conflicts through constraint propagation.

### Timeouts and Limitations

Each benchmark execution has a 30-second timeout to prevent excessively long searches.

The benchmark runs included:

| Graph Size | Completed Records | Timeouts |
|---|---:|---:|
| 10 | 18 | 0 |
| 25 | 17 | 1 |
| 50 | 14 | 4 |
| 100 | 14 | 4 |

Some benchmark runs exceeded the time limit, particularly on larger and more difficult configurations.

The consolidated results file contains 71 records rather than the 72 planned executions because one earlier timeout was not included in the saved CSV.

Timeouts limit direct comparisons because the affected algorithms did not finish exploring their search spaces.

The results also depend on the generated graph structure, domain restrictions, and ordering of variables and values.

Overall, the experiments show that MAC can substantially reduce search effort, although the additional cost of AC-3 propagation must also be considered when evaluating performance.

## 4. Theoretical vs. Empirical Complexity

### Naive Backtracking Complexity

Naive backtracking explores possible assignments of physical registers to virtual registers until it finds a valid solution or determines that no solution exists.

Let:

- **n** = Number of virtual registers.
- **d** = Maximum number of physical registers available to each variable.
- **e** = Number of interference edges.

Each variable can have up to d possible values. Therefore, the maximum number of complete assignments is:

**O(d^n)**

This represents exponential growth in the number of possible register assignments.

Although the solver checks constraints during the search and can reject invalid partial assignments, its worst-case search complexity remains exponential.

For example, with 10 virtual registers and 4 possible physical registers, the number of potential complete assignments is:

**4^10 = 1,048,576**

With 100 virtual registers and 4 physical registers, the number of potential assignments increases to:

**4^100 ≈ 1.61 × 10^60**

These values represent the theoretical assignment space, not the actual number of nodes visited during execution.

Register allocation can be modeled as graph coloring, which is NP-complete when the number of available colors is part of the input. For a fixed register budget of at least three, determining whether an arbitrary graph can be colored is also NP-complete.

Therefore, naive backtracking cannot be expected to solve every large instance efficiently.

### MAC and AC-3 Complexity

Maintaining Arc Consistency (MAC) improves backtracking by applying AC-3 constraint propagation after assignments.

AC-3 examines directed arcs between constrained variables and removes domain values that have no compatible support in neighboring domains.

For a general binary CSP, the standard worst-case time complexity of AC-3 is:

**O(e × d³)**

Here, e represents the number of binary constraints, and d represents the maximum domain size.

Because the register allocation problem uses binary inequality constraints, checking whether two values are compatible is simpler than evaluating an arbitrary binary relation.

For an inequality constraint, a value has support whenever the neighboring domain contains at least one different value. This makes it possible to implement more efficient revision checks.

However, the actual AC-3 running time depends on the implementation, including how domain values are checked and how arcs are managed in the queue.

MAC repeatedly performs constraint propagation during backtracking. Although propagation can greatly reduce the number of explored nodes, it does not eliminate the exponential worst-case complexity of the underlying CSP.

In difficult instances, MAC may still require exponential search.

### Comparison with Experimental Results

The benchmark results demonstrate how the theoretical complexity relates to actual solver behavior.

| Configuration | Naive Nodes | MAC Nodes | Reduction in Nodes |
|---|---:|---:|---:|
| 10 variables, 2 registers, 20% density | 270 | 2 | 99.26% |
| 10 variables, 4 registers, 20% density | 19 | 10 | 47.37% |
| 10 variables, 4 registers, 80% density | 1,364 | 40 | 97.07% |
| 100 variables, 4 registers, 20% density | 104,810,900 | 40 | Greater than 99.99% |

The node reduction percentage is calculated as:

**Reduction = ((Naive Nodes − MAC Nodes) / Naive Nodes) × 100**

For the 100-variable configuration, naive backtracking visited over 104 million nodes, while MAC visited only 40.

This is consistent with the theoretical expectation that constraint propagation can eliminate large portions of the search space before exploring them.

However, the results do not mean that MAC has polynomial worst-case complexity. Both solvers can still require exponential search on difficult CSP instances.

The experimental results also show that the effectiveness of MAC depends on the structure of the interference graph.

Graphs with restrictive constraints may allow AC-3 to detect contradictions early, while other graphs may require substantial backtracking even after propagation.

Furthermore, fewer search nodes do not always guarantee a shorter execution time because MAC performs additional work to maintain arc consistency.

A complete performance comparison must therefore consider nodes visited, backtracks, AC-3 revisions, and execution time.

### Theoretical and Empirical Conclusions

The theoretical analysis predicts exponential worst-case search growth for both naive backtracking and MAC.

The empirical results demonstrate that MAC can significantly reduce the number of explored search nodes by combining constraint propagation with MRV, Degree, and LCV heuristics.

The largest observed improvements occurred when AC-3 detected inconsistencies early, preventing the solver from exploring large numbers of invalid assignments.

The results support the conclusion that constraint propagation and search heuristics improve practical performance, even though they do not change the exponential worst-case complexity of general graph coloring problems.

##  Conclusion

This project implemented and evaluated two approaches to solving register allocation as a Constraint Satisfaction Problem: naive backtracking and Maintaining Arc Consistency (MAC).

The CSP was modeled using virtual registers as variables, physical registers as domains, and binary inequality constraints representing register interference.

The MAC implementation combined AC-3 constraint propagation with Minimum Remaining Values (MRV), Degree, and Least Constraining Value (LCV) heuristics.

Benchmark experiments demonstrated that MAC can substantially reduce the number of search nodes and backtracks compared with naive backtracking, especially on difficult unsatisfiable instances.

Although both algorithms retain exponential worst-case search complexity, the experimental results demonstrate the practical benefits of constraint propagation and heuristic search for register allocation problems.