import ast

from tracked_module import TrackedModule

test_code = """
a, b = 1, 2
"""

test_module = TrackedModule(test_code, "<code>")

print("[AST Dump]")
print(ast.dump(test_module.original_tree, indent=2))

print()
print("[Unparse result]")

print(test_module.unparse())


print()
print("[Exec result]")

result = test_module.exec()

print()
print("[Track result]")
print(result)
