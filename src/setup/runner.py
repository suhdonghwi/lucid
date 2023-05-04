import ast
from tracker_attacher import TrackerAttacher


class RunError:
    def __init__(
        self,
        message: str,
        line: int | None,
        end_line: int | None,
        offset: int | None,
        end_offset: int | None,
    ) -> None:
        self.message = message

        self.line = line
        self.end_line = end_line

        self.offset = offset
        self.end_offset = end_offset


def run(code: str):
    try:
        tree = ast.parse(code)
        attacher = TrackerAttacher("_track")

        attached_tree = attacher.attach(tree)
        exec_result = attached_tree.exec()
    except SyntaxError as e:
        return RunError(e.msg, e.lineno, e.end_lineno, e.offset, e.end_offset)

    return list(map(lambda x: x.to_dict(), exec_result))
