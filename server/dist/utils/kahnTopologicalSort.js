"use strict";
/**
 * Performs a topological sort on a directed acyclic graph (DAG) using Kahn's algorithm.
 *
 * @param adjList - A map representing the adjacency list of the graph where each key is a node ID
 * and the corresponding value is an array of IDs representing nodes it points to.
 * @returns An array of node IDs in topologically sorted order.
 * @throws Will throw an error if the graph contains a cycle, as a topological sort is not possible.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.kahnTopologicalSort = kahnTopologicalSort;
function kahnTopologicalSort(adjList) {
    const inDegree = new Map();
    const queue = [];
    const sorted = [];
    for (const id of adjList.keys())
        inDegree.set(id, 0);
    for (const [u, neighbors] of adjList) {
        for (const v of neighbors) {
            inDegree.set(v, (inDegree.get(v) || 0) + 1);
        }
    }
    for (const [id, deg] of inDegree) {
        if (deg === 0)
            queue.push(id);
    }
    while (queue.length > 0) {
        const u = queue.shift();
        sorted.push(u);
        for (const v of adjList.get(u)) {
            inDegree.set(v, inDegree.get(v) - 1);
            if (inDegree.get(v) === 0)
                queue.push(v);
        }
    }
    if (sorted.length !== adjList.size) {
        throw new Error('Cycle detected in task dependencies');
    }
    return sorted;
}
