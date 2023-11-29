from types import ModuleType
from typing import Callable, Sequence

import os.path
import sys

from importlib.abc import Loader, MetaPathFinder
from importlib.util import spec_from_file_location


class CustomLoaderPathFinder(MetaPathFinder):
    def __init__(self, loader_constructor: Callable[[str], Loader]):
        self.loader_constructor = loader_constructor

    def find_spec(
        self,
        fullname: str,
        path: Sequence[str] | None,
        target: ModuleType | None = None,
    ):
        if path is None or path == "":
            path = [os.getcwd()]  # top level import --
        if "." in fullname:
            *_, name = fullname.split(".")
        else:
            name = fullname
        for entry in path:
            if os.path.isdir(os.path.join(entry, name)):
                # this module has child modules
                filename = os.path.join(entry, name, "__init__.py")
                submodule_locations = [os.path.join(entry, name)]
            else:
                filename = os.path.join(entry, name + ".py")
                submodule_locations = None
            if not os.path.exists(filename):
                continue

            return spec_from_file_location(
                fullname,
                filename,
                loader=self.loader_constructor(filename),
                submodule_search_locations=submodule_locations,
            )

        return None  # we don't know how to import this
