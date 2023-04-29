import ast

from tracker_attacher import TrackerAttacher


code = """
def add(a: int, b: int):
    return a + b

print(add(10, 20))
"""

tree = ast.parse(code)

print("[AST Dump]")
print(ast.dump(tree, indent=2))

attacher = TrackerAttacher("_track")
attached_tree = attacher.attach(tree)

print()
print("[Unparse result]")

print(attached_tree.unparse())


print()
print("[Exec result]")

result = attached_tree.exec()
print(result)
