import clsx from "clsx";
import React, { memo, useMemo } from "react";
import { RussianDoll } from "@/components/ui/russian-doll.tsx";

const STYLES = {
  LINE_WIDTH: 1,
  CONNECTOR_SIZE: 18,
  COLUMN_GAP: 32,
  NODE_PADDING: 16,
};

/** A node reference: either an ID string, or an object with overrides */
export type FlowNodeId = string;
export type FlowNodeRef =
  | FlowNodeId
  | {
      /** stable identifier */
      id: FlowNodeId;
      /** display title (defaults to id) */
      title?: string;
      /** optional custom React element to render inside this node */
      element?: React.ReactNode;
    };
/** An item in a column: either a node or a nested fork (columns definition) */
export type FlowColumnItem = FlowNodeRef | FlowColumnsDefinition;
export type FlowColumn = FlowColumnItem[];
/** A fork is an array of columns */
export type FlowColumnsDefinition = FlowColumn[];
/** The overall graph: a sequence of nodeRefs or a main columns definition */
export type FlowGraphDefinition = FlowColumnItem[];

/** Top-level prop for Flow */
export interface Nodes {
  graph: FlowGraphDefinition;
}

type ParsedGraphResult = {
  initialNodeRefs: FlowNodeRef[];
  mainColumnsDefinition: FlowColumnsDefinition | null;
  rejoinNodeRefs: FlowNodeRef[];
  hasRejoinNodes: boolean;
};

const getColumnContainerClasses = (): string => {
  return "flex flex-row justify-center gap-x-[var(--column-gap)] bg-background relative  h-full";
};

const getNodePaddingClasses = (
  _isFirst: boolean,
  hasBottomPadding: boolean
): string => {
  const paddingTopClass = `pt-[var(--node-padding)]`;
  const paddingBottomClass = hasBottomPadding ? `pb-[var(--node-padding)]` : "";
  return `${paddingTopClass} ${paddingBottomClass} relative`.trim();
};

const BASE_BORDER_STYLES: React.CSSProperties = {
  borderTopWidth: "var(--line-width)",
  borderTopStyle: "solid",
  borderTopColor: "var(--border)",
};
const FULL_BORDER_STYLES: React.CSSProperties = {
  ...BASE_BORDER_STYLES,
  borderBottomWidth: "var(--line-width)",
  borderBottomStyle: "solid",
  borderBottomColor: "var(--border)",
};
type LineProps = React.HTMLAttributes<HTMLDivElement>;
const Line = memo(function Line({ className, ...rest }: LineProps) {
  return <div className={clsx("bg-border", className)} {...rest} />;
});

type ConnectorProps = {
  side?: "left" | "right";
  hasNextSibling?: boolean;
};
const Connector = memo(function Connector({
  side,
  hasNextSibling = false,
}: ConnectorProps) {
  if (side === "left" || side === "right") {
    const isLeft = side === "left";
    const coverStyles: React.CSSProperties = {
      top: "calc(-1 * var(--line-width))",
      bottom: "calc(-1 * var(--line-width))",
      [isLeft ? "left" : "right"]: 0,
      [isLeft ? "right" : "left"]: "calc(50% - var(--corner-offset))",
    };
    const cornerOffset = "calc(50% - var(--corner-offset))";
    const lineOffset = "calc(-1 * var(--line-width))";
    const topCornerClass = clsx(
      "absolute border-t border-[var(--border)]",
      isLeft ? "border-l rounded-tl-md" : "border-r rounded-tr-md"
    );
    const topCornerStyle: React.CSSProperties = {
      width: "var(--connector-size)",
      height: "var(--connector-size)",
      [isLeft ? "borderLeftWidth" : "borderRightWidth"]: "var(--line-width)",
      borderTopWidth: "var(--line-width)",
      [isLeft ? "right" : "left"]: cornerOffset,
      top: lineOffset,
    };
    const bottomCornerClass = clsx(
      "absolute border-b border-[var(--border)]",
      isLeft ? "border-l rounded-bl-md" : "border-r rounded-br-md"
    );
    const bottomCornerStyle: React.CSSProperties = {
      width: "var(--connector-size)",
      height: "var(--connector-size)",
      [isLeft ? "borderLeftWidth" : "borderRightWidth"]: "var(--line-width)",
      borderBottomWidth: "var(--line-width)",
      [isLeft ? "right" : "left"]: cornerOffset,
      bottom: lineOffset,
    };
    return (
      <>
        <div className="absolute bg-background" style={coverStyles} />
        <div className={topCornerClass} style={topCornerStyle} />
        {hasNextSibling && (
          <div className={bottomCornerClass} style={bottomCornerStyle} />
        )}
      </>
    );
  }
  return (
    <Line className="absolute left-1/2 -translate-x-1/2 top-0 h-[var(--connector-size)] w-[var(--line-width)]" />
  );
});

function shouldDrawBranchConnector(
  _item: FlowNodeId,
  column: FlowColumn,
  itemIndex: number,
  colIndex: number,
  totalColumns: number,
  hasNextSibling: boolean
): boolean {
  if (!hasNextSibling) {
    return false;
  }

  const isLastNodeInBranch = itemIndex === column.length - 1;
  const isLastColumn = colIndex === totalColumns - 1;

  if (isLastNodeInBranch && !isLastColumn) {
    return true;
  }

  return false;
}

const ColumnComponent = memo(function ColumnComponent({
  column,
  colIndex,
  totalColumns,
  baseKey,
  hasNextSibling,
}: {
  column: FlowColumn;
  colIndex: number;
  totalColumns: number;
  baseKey: string;
  hasNextSibling: boolean;
}) {
  const isFirstColumn = colIndex === 0;
  const isLastColumn = colIndex === totalColumns - 1;
  const isMiddleColumn = !isFirstColumn && !isLastColumn;

  return (
    <div
      key={`${baseKey}-col-${colIndex}`}
      className="flex flex-col items-center bg-background relative pb-[var(--node-padding)]"
    >
      {isFirstColumn && (
        <Connector side="left" hasNextSibling={hasNextSibling} />
      )}
      {isLastColumn && (
        <Connector side="right" hasNextSibling={hasNextSibling} />
      )}
      {isMiddleColumn && <Connector />}
      {column.map((item, itemIndex) => {
        const itemKey = `${baseKey}-col-${colIndex}-item-${itemIndex}`;
        const hasContinuation = itemIndex < column.length - 1;
        const isConverging = itemIndex === column.length - 1 && hasNextSibling;
        // Node reference (string or object)
        if (!Array.isArray(item)) {
          const { id, title, element } = normalizeNodeRef(item as FlowNodeRef);
          const needsConnectorAbove =
            itemIndex > 0 && Array.isArray(column[itemIndex - 1]);
          return (
            <React.Fragment key={itemKey}>
              <div
                className={clsx(
                  getNodePaddingClasses(itemIndex === 0, hasContinuation),
                  isConverging && "flex-1 flex flex-col items-center"
                )}
              >
                {needsConnectorAbove && (
                  <Line className="absolute top-0 left-1/2 -translate-x-1/2 h-[var(--node-padding)] w-[var(--line-width)]" />
                )}
                <div className="z-1">
                  <RussianDoll title={title}>{element}</RussianDoll>
                </div>
                {shouldDrawBranchConnector(
                  id,
                  column,
                  itemIndex,
                  colIndex,
                  totalColumns,
                  hasNextSibling
                ) && (
                  <Line className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[calc(var(--node-padding))] w-[var(--line-width)]" />
                )}
                {hasContinuation && (
                  <Line className="absolute bottom-[calc(-1*var(--node-padding))] left-1/2 -translate-x-1/2 h-[calc(2*var(--node-padding))] w-[var(--line-width)]" />
                )}
                {isConverging && (
                  <Line className="flex-1 w-[var(--line-width)]" />
                )}
                {isConverging && !isFirstColumn && !isLastColumn && (
                  <Line className="absolute bottom-[calc(-1*var(--node-padding))] left-1/2 -translate-x-1/2 h-[var(--node-padding)] w-[var(--line-width)]" />
                )}
              </div>
            </React.Fragment>
          );
        }
        // Nested fork
        const nested = item as FlowColumnsDefinition;
        const hasNext = itemIndex < column.length - 1;
        const willConverge = hasNextSibling && itemIndex === column.length - 1;
        return (
          <NestedColumns
            key={itemKey}
            columns={nested}
            baseKey={itemKey}
            hasNextSibling={hasNext || willConverge}
          />
        );
      })}
    </div>
  );
});

const NestedColumns = memo(function NestedColumns({
  columns,
  baseKey,
  hasNextSibling,
}: {
  columns: FlowColumnsDefinition;
  baseKey: string;
  hasNextSibling: boolean;
}) {
  const borderStyles: React.CSSProperties = hasNextSibling
    ? FULL_BORDER_STYLES
    : BASE_BORDER_STYLES;

  return (
    <div
      key={`${baseKey}-cols-container`}
      className={getColumnContainerClasses()}
      style={borderStyles}
    >
      {columns.map((column, colIndex) => (
        <ColumnComponent
          key={`${baseKey}-col-${colIndex}`}
          column={column}
          colIndex={colIndex}
          totalColumns={columns.length}
          baseKey={baseKey}
          hasNextSibling={hasNextSibling}
        />
      ))}
    </div>
  );
});

/**
 * Normalize a FlowNodeRef into { id, title, element }
 */
function normalizeNodeRef(ref: FlowNodeRef): {
  id: string;
  title: string;
  element?: React.ReactNode;
} {
  if (typeof ref === "string") {
    return { id: ref, title: ref };
  }
  return { id: ref.id, title: ref.title ?? ref.id, element: ref.element };
}

function parseGraphDefinition(graph: FlowGraphDefinition): ParsedGraphResult {
  const initialNodeRefs: FlowNodeRef[] = [];
  let mainColumnsDefinition: FlowColumnsDefinition | null = null;
  const rejoinNodeRefs: FlowNodeRef[] = [];

  for (const item of graph) {
    // node reference (string or object)
    if (
      typeof item === "string" ||
      (typeof item === "object" && !Array.isArray(item) && "id" in item)
    ) {
      if (mainColumnsDefinition) {
        rejoinNodeRefs.push(item as FlowNodeRef);
      } else {
        initialNodeRefs.push(item as FlowNodeRef);
      }
      // main fork definition
    } else if (Array.isArray(item) && !mainColumnsDefinition) {
      const isPotentialColumnsDefinition = item.every(Array.isArray);
      if (isPotentialColumnsDefinition) {
        mainColumnsDefinition = item as FlowColumnsDefinition;
      } else {
        throw new Error(
          `Invalid main structure: Expected an array of columns (Array<Array<...>>). Found: ${JSON.stringify(
            item
          )}`
        );
      }
    } else if (mainColumnsDefinition) {
      throw new Error(
        `Multiple main column definitions found or invalid item after definition. Found: ${JSON.stringify(
          item
        )}`
      );
    } else {
      throw new Error(
        `Invalid item in main graph definition: ${JSON.stringify(item)}`
      );
    }
  }

  return {
    initialNodeRefs,
    mainColumnsDefinition,
    rejoinNodeRefs,
    hasRejoinNodes: rejoinNodeRefs.length > 0,
  };
}

export const FlowDiagram = memo(function FlowDiagram({
  nodes,
}: {
  nodes: Nodes;
}) {
  const {
    initialNodeRefs,
    mainColumnsDefinition,
    rejoinNodeRefs,
    hasRejoinNodes,
  } = useMemo(() => parseGraphDefinition(nodes.graph), [nodes.graph]);

  const cornerOffset = `${STYLES.CONNECTOR_SIZE - STYLES.LINE_WIDTH / 2}px`;

  const flowStyleVariables = {
    "--line-width": `${STYLES.LINE_WIDTH}px`,
    "--connector-size": `${STYLES.CONNECTOR_SIZE}px`,
    "--corner-offset": cornerOffset,
    "--column-gap": `${STYLES.COLUMN_GAP}px`,
    "--node-padding": `${STYLES.NODE_PADDING}px`,
    "--border-color": "hsl(var(--border))",
  } as React.CSSProperties;

  const initialNodes = initialNodeRefs.map((ref) => {
    const { id, title, element } = normalizeNodeRef(ref);
    return (
      <RussianDoll
        key={id}
        title={title}
        className={clsx("py-[var(--node-padding)]")}
      >
        {element}
      </RussianDoll>
    );
  });
  const rejoinNodes = rejoinNodeRefs.map((ref) => {
    const { id, title, element } = normalizeNodeRef(ref);
    return (
      <RussianDoll
        key={id}
        title={title}
        className={clsx("py-[var(--node-padding)]")}
      >
        {element}
      </RussianDoll>
    );
  });

  return (
    <div
      className="flex flex-col items-center relative bg-background"
      style={flowStyleVariables}
    >
      <Line className="absolute top-5 bottom-5 left-1/2 transform -translate-x-1/2 w-[var(--line-width)]" />
      {initialNodes}
      {mainColumnsDefinition && (
        <NestedColumns
          columns={mainColumnsDefinition}
          baseKey="main"
          hasNextSibling={hasRejoinNodes}
        />
      )}
      {rejoinNodes}
    </div>
  );
});
