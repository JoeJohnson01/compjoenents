type Nodes = {
  graph: FlowGraphDefinition;
};

// The graph can contain node references or column definitions
type FlowGraphDefinition = (FlowNodeRef | FlowColumnsDefinition)[];

// A node reference can be a string ID or an object with properties
type FlowNodeRef =
  | string
  | {
      id: string;
      title?: string;
      element?: React.ReactNode;
    };

// A columns definition is an array of columns (for forks)
type FlowColumnsDefinition = FlowColumn[];

// A column is an array of items (nodes or nested forks)
type FlowColumn = (FlowNodeRef | FlowColumnsDefinition)[];
