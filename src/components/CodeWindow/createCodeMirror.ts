// Copied and slightly modified from:
// https://github.com/riccardoperra/solid-codemirror

import { createEffect, createSignal, on, onCleanup, onMount } from "solid-js";

import { EditorView, ViewUpdate } from "@codemirror/view";
import { EditorState } from "@codemirror/state";

export interface CreateCodeMirrorProps {
  /**
   * The initial value of the editor
   */
  value: string;
  /**
   * Fired whenever the editor code value changes.
   */
  onValueChange?: (value: string) => void;
  /**
   * Fired whenever a change occurs to the document, every time the view updates.
   */
  onModelViewUpdate?: (vu: ViewUpdate) => void;
}

/**
 * Creates a CodeMirror editor instance.
 */
export function createCodeMirror(props: CreateCodeMirrorProps) {
  const [ref, setRef] = createSignal<HTMLElement>();
  const [editorView, setEditorView] = createSignal<EditorView>();

  createEffect(
    on(ref, (ref) => {
      const state = EditorState.create({ doc: props.value });
      const currentView = new EditorView({
        state,
        parent: ref,
        // Replace the old `updateListenerExtension`
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
        const localValue = editorView?.state.doc.toString();
        if (localValue !== props.value && editorView !== undefined) {
          editorView.dispatch({
            changes: {
              from: 0,
              to: localValue?.length,
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
