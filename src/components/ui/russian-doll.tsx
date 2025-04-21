import { AnimatePresence, motion } from "framer-motion";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

interface RussianDollContextType {
  parentExpanded: boolean;
  requestWidthUpdate: () => void;
  resetChildrenState: boolean;
  notifyExpandStart?: (childHeight: number) => void;
}

const RussianDollContext = createContext<RussianDollContextType>({
  parentExpanded: true,
  requestWidthUpdate: () => {},
  resetChildrenState: false,
  notifyExpandStart: undefined,
});

interface RussianDollComponentProps {
  title: string;
  children?: ReactNode;
  onToggle?: (expanded: boolean) => void;
  className?: string;
}

export function RussianDoll({
  title,
  children,
  onToggle,
  className,
}: RussianDollComponentProps) {
  const { parentExpanded, requestWidthUpdate, resetChildrenState } =
    useContext(RussianDollContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldResetChildren, setShouldResetChildren] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [childIsHovered, setChildIsHovered] = useState(false);

  const russianDollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const collapsedWidth = 160;

  // Separate nested <RussianDoll> children (expandable) from other custom children
  const childrenArray = React.Children.toArray(children);
  const russianDollChildren = childrenArray.filter(
    (child) =>
      React.isValidElement(child) &&
      typeof child.type === "function" &&
      ((child.type as React.ComponentType<RussianDollComponentProps>)
        .displayName === "RussianDoll" ||
        (child.type as React.ComponentType<RussianDollComponentProps>).name ===
          "RussianDoll")
  );
  const otherChildren = childrenArray.filter(
    (child) => !russianDollChildren.includes(child)
  );
  // A russianDoll with any custom or nested RussianDoll children is expandable
  const isExpandable =
    russianDollChildren.length > 0 || otherChildren.length > 0;

  const handleChildHover = useCallback((isHovered: boolean) => {
    setChildIsHovered(isHovered);
  }, []);

  const triggerChildrenReset = useCallback(() => {
    setShouldResetChildren(true);
    setTimeout(() => {
      setShouldResetChildren(false);
    }, 50);
  }, []);

  useEffect(() => {
    if (resetChildrenState) {
      setIsExpanded(false);
      triggerChildrenReset();
    }
  }, [resetChildrenState, triggerChildrenReset]);

  const toggleExpand = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (isExpandable) {
      const newExpandedState = !isExpanded;
      setIsExpanded(newExpandedState);

      if (onToggle) {
        onToggle(newExpandedState);
      }

      if (!newExpandedState) {
        triggerChildrenReset();
      } else if (requestWidthUpdate) {
        requestWidthUpdate();
      }
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const effectivelyExpanded = isExpanded && parentExpanded;

  const showHoverEffect = isHovering && !childIsHovered;

  const handleChildWidthUpdate = useCallback(() => {
    if (requestWidthUpdate) {
      requestWidthUpdate();
    }
  }, [requestWidthUpdate]);

  return (
    <div className={className}>
      <RussianDollContext.Provider
        value={{
          parentExpanded: effectivelyExpanded,
          requestWidthUpdate: handleChildWidthUpdate,
          resetChildrenState: shouldResetChildren,
        }}
      >
        <motion.div
          ref={russianDollRef}
          className={`relative`}
          initial={false}
          animate={{
            width: effectivelyExpanded ? "fit-content" : `${collapsedWidth}px`,
          }}
          transition={{
            width: {
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1],
            },
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ minWidth: `${collapsedWidth}px` }}
        >
          <Card
            ref={cardRef}
            className={`p-0 gap-0 ${
              !effectivelyExpanded && isExpandable
                ? "border-[2px] border-primary/60"
                : ""
            }
                                ${
                                  isExpandable && showHoverEffect
                                    ? "bg-secondary transition-colors duration-200"
                                    : ""
                                }`}
            onClick={toggleExpand}
            style={{
              cursor: isExpandable ? "pointer" : "default",
              minWidth: `${collapsedWidth}px`,
              width: "100%",
            }}
          >
            <CardHeader className="p-2 gap-0 flex items-center justify-center">
              <CardTitle className="text-center text-sm">{title}</CardTitle>
            </CardHeader>
            {/* Render nested <RussianDoll> children in expandable section */}
            {isExpandable && (
              <AnimatePresence initial={false}>
                <motion.div
                  className="overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: effectivelyExpanded ? "auto" : 0,
                    opacity: effectivelyExpanded ? 1 : 0,
                  }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: {
                      duration: 0.3,
                      ease: [0.25, 0.1, 0.25, 1],
                    },
                    opacity: {
                      duration: 0.2,
                    },
                  }}
                >
                  <div ref={contentRef} className="w-full">
                    <CardContent className="px-4 pb-4">
                      <div
                        className="flex flex-col items-center gap-4 relative w-full"
                        onMouseEnter={() => handleChildHover(true)}
                        onMouseLeave={() => handleChildHover(false)}
                      >
                        {/* show any custom children first */}
                        {otherChildren}
                        {/* then show nested RussianDoll children */}
                        {russianDollChildren}
                      </div>
                    </CardContent>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </Card>
        </motion.div>
      </RussianDollContext.Provider>
    </div>
  );
}

RussianDoll.displayName = "RussianDoll";
