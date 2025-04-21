// Define interface for component props
export interface ComponentProp {
  name: string;
  type: string;
  isOptional: boolean;
  defaultValue?: any;
}

/**
 * Extract props from component code
 * @param componentCode The source code of the component
 * @param defaultProps Default props from frontmatter
 * @returns Array of ComponentProp objects
 */
export function extractComponentProps(
  componentCode: string,
  defaultProps: Record<string, any> = {}
): ComponentProp[] {
  // Extract props from component code
  const propsMatch = componentCode.match(/interface Props[\s\S]*?\{([\s\S]*?)\}/m);
  let propsCode = propsMatch ? propsMatch[1].trim() : '';
  let propsList: ComponentProp[] = [];

  if (propsCode) {
    // Parse props into a usable format
    const propLines = propsCode.split('\n').map(line => line.trim()).filter(line => line);
    propsList = propLines.map(line => {
      const [name, type] = line.replace(/[?:;]/g, ' ').split(' ').filter(Boolean);
      const isOptional = line.includes('?:');

      // Get default value from frontmatter if available
      const defaultValue = defaultProps && defaultProps[name] !== undefined
        ? defaultProps[name]
        : undefined;

      return { name, type, isOptional, defaultValue };
    });
  }

  return propsList;
}
