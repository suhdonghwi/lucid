import React from "react";

type CodeTextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

function CodeTextArea({ ...props }: CodeTextAreaProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      e.currentTarget.blur();
    }
  }

  return (
    <textarea
      {...props}
      onKeyDown={handleKeyDown}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      data-gramm={false}
    />
  );
}

export default CodeTextArea;
