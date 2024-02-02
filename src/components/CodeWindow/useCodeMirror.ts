// This code is mostly copy-and-pasted from...
// https://github.com/uiwjs/react-codemirror/blob/528759f6f0b47bd0bebdb7c49bfbec63dbd56264/core/src/useCodeMirror.ts

import { useEffect, useMemo, useState } from "react";
import {
  Annotation,
  EditorState,
  Extension,
  StateEffect,
} from "@codemirror/state";
import { EditorView, ViewUpdate } from "@codemirror/view";

const External = Annotation.define<boolean>();

export interface UseCodeMirror {
  value: string;
  extensions: Extension[];

  onChange?: (value: string, viewUpdate: ViewUpdate) => void;
  onCreateEditor?: (view: EditorView, state: EditorState) => void;
}

export function useCodeMirror({
  value,
  extensions,
  onChange,
  onCreateEditor,
}: UseCodeMirror) {
  const [container, setContainer] = useState<HTMLDivElement>();
  const [view, setView] = useState<EditorView | null>(null);
  const [state, setState] = useState<EditorState | null>(null);

  const updateListener = useMemo(
    () =>
      EditorView.updateListener.of((view: ViewUpdate) => {
        if (
          view.docChanged &&
          onChange !== undefined &&
          // Fix echoing of the remote changes:
          // If transaction is market as remote we don't have to call `onChange` handler again
          !view.transactions.some((tr) => tr.annotation(External))
        ) {
          const doc = view.state.doc;
          const value = doc.toString();
          onChange(value, view);
        }
      }),
    [onChange],
  );

  useEffect(() => {
    if (container && state === null) {
      const stateCurrent = EditorState.create();
      setState(stateCurrent);

      if (!view) {
        const viewCurrent = new EditorView({
          state: stateCurrent,
          parent: container,
        });

        setView(viewCurrent);
        onCreateEditor?.(viewCurrent, stateCurrent);
      }
    }

    return () => {
      if (view) {
        setState(null);
        setView(null);
      }
    };
  }, [container, state, view, onCreateEditor]);

  useEffect(() => {
    return () => {
      if (view) {
        view.destroy();
        setView(null);
      }
    };
  }, [view]);

  useEffect(() => {
    if (view) {
      const finalExtensions = extensions.concat([updateListener]);
      view.dispatch({ effects: StateEffect.reconfigure.of(finalExtensions) });
    }
  }, [view, updateListener, extensions]);

  useEffect(() => {
    const currentValue = view ? view.state.doc.toString() : "";
    if (view && value !== currentValue) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value || "" },
        annotations: [External.of(true)],
      });
    }
  }, [view, value]);

  return { view, container, setContainer };
}
