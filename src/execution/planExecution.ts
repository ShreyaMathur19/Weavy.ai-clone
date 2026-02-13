import { Node, Edge } from "reactflow";

/**
 * Execution modes
 */
export type ExecutionMode = "full" | "selected" | "single";

/**
 * Execution node definition
 */
export type ExecutionNode = {
  id: string;
  dependencies: string[];
};

/**
 * Final execution plan
 */
export type ExecutionPlan = {
  nodes: Record<string, ExecutionNode>;
  roots: string[];
  order: string[];        // deterministic topo order
  layers: string[][];     // parallel execution groups
};

/**
 * Main planner
 */
export function planExecution(
  nodes: Node[],
  edges: Edge[],
  mode: ExecutionMode,
  selectedNodeIds: string[] = []
): ExecutionPlan {

  // ---------------------------------------------
  // STEP 1: Build dependency graph
  // ---------------------------------------------

  const nodeIds = new Set(nodes.map((n) => n.id));

  const dependencies: Record<string, string[]> = {};
  const outgoing: Record<string, string[]> = {};

  for (const node of nodes) {
    dependencies[node.id] = [];
    outgoing[node.id] = [];
  }

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      throw new Error(`Invalid edge: ${edge.id}`);
    }

    dependencies[edge.target].push(edge.source);
    outgoing[edge.source].push(edge.target);
  }

  // ---------------------------------------------
  // STEP 2: Determine execution scope
  // ---------------------------------------------

  let included = new Set<string>();

  if (mode === "full") {
    included = new Set(nodeIds);
  }

  if (mode === "single") {
    if (selectedNodeIds.length !== 1) {
      throw new Error("Single mode requires exactly one node");
    }
    includeAncestors(selectedNodeIds[0], dependencies, included);
  }

  if (mode === "selected") {
    if (selectedNodeIds.length === 0) {
      throw new Error("Selected mode requires at least one node");
    }
    for (const id of selectedNodeIds) {
      includeAncestors(id, dependencies, included);
    }
  }

  // ---------------------------------------------
  // STEP 3: Validate DAG
  // ---------------------------------------------

  validateDAG(included, outgoing);

  // ---------------------------------------------
  // STEP 4: Build execution nodes
  // ---------------------------------------------

  const executionNodes: Record<string, ExecutionNode> = {};

  for (const id of included) {
    executionNodes[id] = {
      id,
      dependencies: dependencies[id].filter((d) => included.has(d)),
    };
  }

  // ---------------------------------------------
  // STEP 5: Find roots
  // ---------------------------------------------

  const roots = Object.values(executionNodes)
    .filter((n) => n.dependencies.length === 0)
    .map((n) => n.id);

  // ---------------------------------------------
  // STEP 6: Deterministic topological sort
  // ---------------------------------------------

  const order = topologicalSort(executionNodes, outgoing);

  // ---------------------------------------------
  // STEP 7: Build parallel layers
  // ---------------------------------------------

  const layers = buildExecutionLayers(executionNodes, outgoing);

  return {
    nodes: executionNodes,
    roots,
    order,
    layers,
  };
}

/**
 * Recursively include ancestors
 */
function includeAncestors(
  nodeId: string,
  dependencies: Record<string, string[]>,
  included: Set<string>
) {
  if (included.has(nodeId)) return;

  included.add(nodeId);

  for (const dep of dependencies[nodeId]) {
    includeAncestors(dep, dependencies, included);
  }
}

/**
 * DFS cycle detection
 */
function validateDAG(
  included: Set<string>,
  outgoing: Record<string, string[]>
) {
  const visited = new Set<string>();
  const stack = new Set<string>();

  function visit(nodeId: string) {
    if (stack.has(nodeId)) {
      throw new Error(`Cycle detected at node ${nodeId}`);
    }

    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    stack.add(nodeId);

    for (const next of outgoing[nodeId] || []) {
      if (included.has(next)) {
        visit(next);
      }
    }

    stack.delete(nodeId);
  }

  for (const id of included) {
    visit(id);
  }
}

/**
 * Deterministic Topological Sort
 */
function topologicalSort(
  nodes: Record<string, { id: string; dependencies: string[] }>,
  outgoing: Record<string, string[]>
): string[] {
  const inDegree: Record<string, number> = {};
  const queue: string[] = [];
  const result: string[] = [];

  for (const id in nodes) {
    inDegree[id] = nodes[id].dependencies.length;
    if (inDegree[id] === 0) {
      queue.push(id);
    }
  }

  queue.sort();

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    for (const next of outgoing[current] || []) {
      if (!(next in inDegree)) continue;

      inDegree[next]--;
      if (inDegree[next] === 0) {
        queue.push(next);
        queue.sort();
      }
    }
  }

  if (result.length !== Object.keys(nodes).length) {
    throw new Error("Topological sort failed");
  }

  return result;
}

/**
 * Build parallel execution layers
 * Each layer can run concurrently
 */
function buildExecutionLayers(
  nodes: Record<string, { id: string; dependencies: string[] }>,
  outgoing: Record<string, string[]>
): string[][] {
  const inDegree: Record<string, number> = {};
  const layers: string[][] = [];
  const remaining = new Set(Object.keys(nodes));

  for (const id in nodes) {
    inDegree[id] = nodes[id].dependencies.length;
  }

  while (remaining.size > 0) {
    const currentLayer: string[] = [];

    for (const id of remaining) {
      if (inDegree[id] === 0) {
        currentLayer.push(id);
      }
    }

    if (currentLayer.length === 0) {
      throw new Error("Cycle detected during layering");
    }

    currentLayer.sort();
    layers.push(currentLayer);

    for (const id of currentLayer) {
      remaining.delete(id);

      for (const next of outgoing[id] || []) {
        if (next in inDegree) {
          inDegree[next]--;
        }
      }
    }
  }

  return layers;
}