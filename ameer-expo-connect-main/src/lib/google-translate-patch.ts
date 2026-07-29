// Protect React DOM from Google Translate wrapping text nodes
if (
  typeof window !== "undefined" &&
  typeof Node !== "undefined" &&
  typeof Node.prototype.removeChild === "function"
) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      // Google Translate already moved/removed this node — ignore instead
      // of letting React crash the tree.
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(node: T, child: Node | null): T {
    if (child && child.parentNode !== this) {
      return node;
    }
    return originalInsertBefore.call(this, node, child) as T;
  };
}
