// Custom Elements Flow Diagram Example

import { FlowDiagram, type Nodes } from "@/components/flow-diagram";
import { Button } from "@/components/ui/button";

const nodes: Nodes = {
  graph: [
    { 
      id: "start", 
      title: "User Registration", 
      element: <div className="text-xs text-muted-foreground">Start of user flow</div>
    },
    [
      [
        { 
          id: "email", 
          title: "Email Signup", 
          element: <Button variant="outline" size="sm">Enter Email</Button>
        }
      ],
      [
        { 
          id: "social", 
          title: "Social Login", 
          element: <div className="flex gap-2">
            <Button variant="secondary" size="sm">Google</Button>
            <Button variant="default" size="sm">GitHub</Button>
          </div>
        }
      ],
    ],
    { 
      id: "profile", 
      title: "Complete Profile", 
      element: <div className="text-xs text-muted-foreground">User enters additional details</div>
    },
    { 
      id: "welcome", 
      title: "Welcome Page", 
      element: <Button variant="default" size="sm">Get Started</Button>
    },
  ],
};

export default function DocumentationCustomFlowDiagram() {
  return <FlowDiagram nodes={nodes} />;
}
