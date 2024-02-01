// Copied and slightly modified from:
// https://github.com/riccardoperra/solid-codemirror

import { createEffect, createSignal, on, onCleanup, onMount } from "solid-js";

import { EditorView } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";

type CreateCodeMirrorProps = {
  class: string;
  value: string;
  onValueChange?: (value: string) => void;
  extensions?: Extension[];
};

export function CodeMirror(props: CreateCodeMirrorProps) {
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
    () => {
      const view = editorView();

      const internalValue = view?.state.doc.toString();
      if (internalValue !== props.value && view !== undefined) {
        view.dispatch({
          changes: {
            from: 0,
            to: internalValue?.length,
            insert: props.value,
          },
        });
      }
    },
    { defer: true },
  );

  return <div class={props.class} ref={setRef} />;
}
