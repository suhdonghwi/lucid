import ast
from tracker_attacher import TrackerAttacher

def run(code: str):
    tree = ast.parse(code)

    attacher = TrackerAttacher("_track")
    attached_tree = attacher.attach(tree)

    return attached_tree.exec()
