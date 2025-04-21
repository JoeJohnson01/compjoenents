// Basic Flow Diagram Example

import { FlowDiagram, type Nodes } from "@/components/flow-diagram";

const nodes: Nodes = {
  graph: [
    "Start Process",
    "Initial Setup",
    [
      ["Branch A", "Process A"],
      ["Branch B", "Process B", "Additional Step B"],
    ],
    "Consolidate Results",
    "Complete",
  ],
};

export default function DocumentationBasicFlowDiagram() {
  return <FlowDiagram nodes={nodes} />;
}
