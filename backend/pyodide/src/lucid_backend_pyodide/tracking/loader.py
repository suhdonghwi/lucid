from importlib.abc import Loader
from importlib.machinery import ModuleSpec

from types import ModuleType


class TrackingLoader(Loader):
    def __init__(self, filename: str):
        self.filename = filename

    def create_module(self, spec: ModuleSpec):
        return None  # use default module creation semantics

    def exec_module(self, module: ModuleType):
        with open(self.filename) as f:
            data = f.read()

        # manipulate data some way...

        exec(data, vars(module))
