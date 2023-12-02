import ast

from .attacher import TrackerAttacher
from .callback import TrackerCallbacks


def tracked_compile(code: str, filename: str, callbacks: TrackerCallbacks):
    raw_ast = ast.parse(code, filename)

    attacher = TrackerAttacher(raw_ast)
    tracked_ast = attacher.attach()
    tracker_mappings = attacher.create_tracker_mappings(callbacks)

    compiled_code = compile(tracked_ast, filename=filename, mode="exec")

    return compiled_code, tracker_mappings
