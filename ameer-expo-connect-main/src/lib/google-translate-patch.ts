// Protect React DOM from Google Translate wrapping text nodes
if (typeof window !== "undefined" && typeof Node !== "undefined" && typeof Node.prototype.removeChild === "function") {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      // Google Translate already moved/removed this node — ignore instead
      // of letting React crash the tree.
      return child;
    }
    return originalRemoveChild.apply(this, arguments as any);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments as any);
  };
}
