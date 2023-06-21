import ast
from tracker_attacher import TrackerAttacher

code = """
def f():
    print("apple")
    print("banana")
    print("coconut")


f()
"""

code2 = """
import random

def roll_dice():
    return random.randint(1, 6)

num_rolls = 5
results = []

for _ in range(num_rolls):
    roll_result = roll_dice()
    results.append(roll_result)

print(f"The results of {num_rolls} dice rolls are: {results}")
"""

code3 = """
def f(x):
    if x == 0:
        return 0
    return f(x-1)

print(f(5))
"""

tree = ast.parse(code3)

print("[AST Dump]")
print(ast.dump(tree, indent=2))

attacher = TrackerAttacher("_track")
attached_tree = attacher.attach(tree)

print()
print("[Unparse result]")

print(attached_tree.unparse())


print()
print("[Exec result]")

result = attached_tree.exec("<code>")
print(result)
