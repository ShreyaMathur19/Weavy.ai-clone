"use client";

import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";

import TextNode from "./nodes/TextNode";
import UploadImageNode from "./nodes/UploadImageNode";
import UploadVideoNode from "./nodes/UploadVideoNode";
import CropImageNode from "./nodes/CropImageNode";
import LLMNode from "./nodes/LLMNode";
import ExtractFrameNode from "./nodes/ExtractFrameNode";

const nodeTypes = {
  text: TextNode,
  uploadImage: UploadImageNode,
  uploadVideo: UploadVideoNode,
  cropImage: CropImageNode,
  llm: LLMNode,
  extractFrame: ExtractFrameNode,
};

interface Props {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onConnect: (connection: Connection) => void;
}

export default function Canvas({
  nodes,
  edges,
  setNodes,
  setEdges,
  onConnect,
}: Props) {
  return (
    <div style={{ flex: 1 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={(changes) =>
          setNodes((nds) => applyNodeChanges(changes, nds))
        }
        onEdgesChange={(changes) =>
          setEdges((eds) => applyEdgeChanges(changes, eds))
        }
        onConnect={onConnect}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}