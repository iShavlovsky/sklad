export function joinPaths(parentPath: string, childPath: string): string {
  if (!parentPath || parentPath === '/') {
    return childPath ? `/${childPath}`.replaceAll(/\/+/g, '/') : '/';
  }
  if (!childPath) return parentPath;
  return `${parentPath}/${childPath}`.replaceAll(/\/+/g, '/');
}
