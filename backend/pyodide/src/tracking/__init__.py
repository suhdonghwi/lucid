import logging
import ast

from .attacher import TrackerAttacher
from .callback import TrackerCallbacks


def execute(code: str, file_name: str, callbacks: TrackerCallbacks):
    raw_ast = ast.parse(code, file_name)

    logging.debug("raw ast dump\n" + ast.dump(raw_ast, indent=2))

    attacher = TrackerAttacher(raw_ast)
    tracked_ast = attacher.attach()
    tracker_mappings = attacher.create_tracker_mappings(callbacks)

    logging.debug("tracked ast unparse\n" + ast.unparse(tracked_ast))

    compiled_code = compile(tracked_ast, filename=file_name, mode="exec")

    exec(compiled_code, tracker_mappings)
