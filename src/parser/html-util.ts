import {
  HTMLElement,
  Node,
  NodeType,
  TextNode,
  CommentNode,
} from 'node-html-parser';

export const isElement = (node: Node): node is HTMLElement =>
  node.nodeType === NodeType.ELEMENT_NODE;

export const isTextNode = (node: Node): node is TextNode =>
  node.nodeType === NodeType.TEXT_NODE;

export const isCommentNode = (node: Node): node is CommentNode =>
  node.nodeType === NodeType.COMMENT_NODE;

export const filterElement = (nodes: Node[]) => {
  return nodes.filter(isElement);
};
