// Copied and slightly modified from:
// https://github.com/riccardoperra/solid-codemirror

import { createEffect, createSignal, on, onCleanup, onMount } from "solid-js";

import { EditorView } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";

type CreateCodeMirrorProps = {
  value: string;
  onValueChange?: (value: string) => void;
  extensions?: Extension[];
};

export function createCodeMirror(props: CreateCodeMirrorProps) {
  const [ref, setRef] = createSignal<HTMLElement>();
  const [editorView, setEditorView] = createSignal<EditorView>();

  createEffect(
    on(ref, (ref) => {
      const state = EditorState.create({
        doc: props.value,
        extensions: props.extensions,
      });
      const currentView = new EditorView({
        state,
        parent: ref,
        dispatch: (transaction) => {
          currentView.update([transaction]);

          if (transaction.docChanged) {
            const document = transaction.state.doc;
            const value = document.toString();
            props.onValueChange?.(value);
          }
        },
      });

      onMount(() => setEditorView(currentView));

      onCleanup(() => {
        editorView()?.destroy();
        setEditorView(undefined);
      });
    }),
  );

  createEffect(
    on(
      editorView,
      (editorView) => {
        const internalValue = editorView?.state.doc.toString();
        if (internalValue !== props.value && editorView !== undefined) {
          editorView.dispatch({
            changes: {
              from: 0,
              to: internalValue?.length,
              insert: props.value,
            },
          });
        }
      },
      { defer: true },
    ),
  );

  return {
    editorView,
    ref: setRef,
  } as const;
}
