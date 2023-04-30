import React from "react";

type EnhancedTextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

function EnhancedTextArea({ ...props }: EnhancedTextAreaProps) {
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

export default EnhancedTextArea;
