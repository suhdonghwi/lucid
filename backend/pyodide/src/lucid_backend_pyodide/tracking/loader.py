from importlib.abc import Loader
from importlib.machinery import ModuleSpec

from types import ModuleType

from . import tracked_compile, TrackerCallbacks


def create_tracking_loader_class(tracker_callbacks: TrackerCallbacks):
    class TrackingLoader(Loader):
        def __init__(self, filename: str):
            self.filename = filename

        def create_module(self, spec: ModuleSpec):
            return None  # use default module creation semantics

        def exec_module(self, module: ModuleType):
            with open(self.filename) as file:
                source = file.read()

            compiled_code, tracker_mappings = tracked_compile(
                source, self.filename, tracker_callbacks
            )

            exec(compiled_code, vars(module) | tracker_mappings)

    return TrackingLoader
