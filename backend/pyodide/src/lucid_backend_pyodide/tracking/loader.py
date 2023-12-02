from importlib.abc import Loader
from importlib.machinery import ModuleSpec

import ast
from types import ModuleType

import tracking
from tracking.attacher import TrackerAttacher


class TrackingLoader(Loader):
    def __init__(self, tracker_callbacks: tracking.TrackerCallbacks):
        self.tracker_callbacks = tracker_callbacks

    def __call__(self, filename: str):
        self.filename = filename
        return self

    def create_module(self, spec: ModuleSpec):
        return None  # use default module creation semantics

    def exec_module(self, module: ModuleType):
        with open(self.filename) as file:
            source = file.read()

        raw_ast = ast.parse(source, self.filename)

        attacher = TrackerAttacher(raw_ast)
        tracked_ast = attacher.attach()
        tracker_mappings = attacher.create_tracker_mappings(self.tracker_callbacks)

        compiled_code = compile(tracked_ast, filename=self.filename, mode="exec")

        exec(compiled_code, vars(module) | tracker_mappings)
