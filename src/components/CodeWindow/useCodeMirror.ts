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
  onChange?: (value: string, viewUpdate: ViewUpdate) => void;

  extensions: Extension[];
}

export function useCodeMirror({ value, extensions, onChange }: UseCodeMirror) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const editorView = useEditorView(container);

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
    if (editorView === null) return;

    const finalExtensions = extensions.concat([updateListener]);
    editorView.dispatch({
      effects: StateEffect.reconfigure.of(finalExtensions),
    });
  }, [editorView, updateListener, extensions]);

  useEffect(() => {
    if (editorView === null) return;

    const currentValue = editorView.state.doc.toString();

    if (value !== currentValue) {
      editorView.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value },
        annotations: [External.of(true)],
      });
    }
  }, [editorView, value]);

  return { editorView, container, setContainer };
}

function useEditorView(container: HTMLDivElement | null) {
  const [editorView, setEditorView] = useState<EditorView | null>(null);

  useEffect(() => {
    if (container !== null && editorView === null) {
      const initialView = new EditorView({
        state: EditorState.create(),
        parent: container,
      });

      setEditorView(initialView);
    }

    return () => {
      if (editorView !== null) {
        editorView.destroy();
        setEditorView(null);
      }
    };
  }, [container, editorView]);

  return editorView;
}
