import ast

from .attacher import TrackerAttacher
from .callback import TrackerCallbacks


def execute(code: str, file_name: str, callbacks: TrackerCallbacks):
    raw_ast = ast.parse(code, file_name)

    attacher = TrackerAttacher(raw_ast)
    tracked_ast = attacher.attach()
    tracker_mappings = attacher.create_tracker_mappings(callbacks)

    compiled_code = compile(tracked_ast, filename=file_name, mode="exec")

    exec(compiled_code, tracker_mappings)
