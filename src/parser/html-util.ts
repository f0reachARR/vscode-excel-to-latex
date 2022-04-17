import { HTMLElement, Node, NodeType } from 'node-html-parser';

export const filterElement = (nodes: Node[]) => {
  return nodes.filter(
    (node): node is HTMLElement => node.nodeType === NodeType.ELEMENT_NODE,
  );
};
