import { create } from "zustand";
import { addEdge, Node, Edge, Connection } from "reactflow";
import { nanoid } from "nanoid";

interface GraphState {
  nodes: Node[];
  edges: Edge[];

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;

  addNode: (type: string) => void;
  onConnect: (connection: Connection) => void;

  updateNodeData: (id: string, newData: any) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (type) => {
    const id = nanoid();

    const newNode: Node = {
      id,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        id,
        onChange: get().updateNodeData,
      },
    };

    set({
      nodes: [...get().nodes, newNode],
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  updateNodeData: (id, newData) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                ...newData,
                id,
                onChange: get().updateNodeData,
              },
            }
          : node
      ),
    });
  },
}));