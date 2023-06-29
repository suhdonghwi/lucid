import ast
from tracker_attacher import TrackerAttacher

code = """
def f():
    print("apple")
    print("banana")
    print("coconut")


f()
"""

tree = ast.parse(code)

print("[AST Dump]")
print(ast.dump(tree, indent=2))

attacher = TrackerAttacher()
attached_tree = attacher.attach(tree)

print()
print("[Unparse result]")

print(attached_tree.unparse())


print()
print("[Exec result]")

result = attached_tree.exec("<code>")
print(result)
