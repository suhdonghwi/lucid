import ast

import tracker_identifier as IDENT

from tracker_attacher import TrackerAttacher

from js import before_stmt


class StmtContext:
    def __init__(self, node: ast.stmt):
        self.node = node

    def __enter__(self):
        before_stmt()
        pass

    def __exit__(self, _1, _2, _3):
        pass


class TrackedModule:
    def __init__(self, source: str, file_name: str):
        self.file_name = file_name
        self.original_tree = ast.parse(source, file_name)

        self.tree_nodes: list[ast.AST] = []
        for node in ast.walk(self.original_tree):
            node._index = len(self.tree_nodes)
            self.tree_nodes.append(node)

        self.tracked_tree = TrackerAttacher().attach(self.original_tree)
        self.compiled_code = compile(
            self.tracked_tree, filename=self.file_name, mode="exec"
        )

    def exec(self):
        def track_before_expr(node_index: int):
            return node_index

        def track_after_expr(node_index: int, value: object):
            return value

        def track_stmt(node_index: int):
            node: ast.stmt = self.tree_nodes[node_index]
            return StmtContext(node)

        namespace = {
            IDENT.TRACKER_BEFORE_EXPR: track_before_expr,
            IDENT.TRACKER_AFTER_EXPR: track_after_expr,
            IDENT.TRACKER_STMT: track_stmt,
        }
        exec(self.compiled_code, namespace)

        return None

    def unparse(self) -> str:
        return ast.unparse(self.tracked_tree)
