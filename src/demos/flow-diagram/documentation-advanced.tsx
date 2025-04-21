// Advanced Flow Diagram Example

import { FlowDiagram, type Nodes } from "@/components/flow-diagram";

const nodes: Nodes = {
  graph: [
    { id: "start", title: "Start Process" },
    "Data Validation",
    [
      [
        "Valid Data",
        [
          ["Process A1", "Process A2"],
          ["Process B1", "Process B2"],
        ],
        "Merge A & B Results",
      ],
      ["Invalid Data", "Error Handling", "Retry Logic"],
    ],
    { id: "final", title: "Complete Process" },
  ],
};

export default function DocumentationAdvancedFlowDiagram() {
  return <FlowDiagram nodes={nodes} />;
}
