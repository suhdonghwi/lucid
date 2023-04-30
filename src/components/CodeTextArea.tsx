import React, { useRef } from "react";

type CodeTextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string;
  onValueChange: (value: string) => void;
  tabSize: number;
};

function CodeTextArea({
  value,
  onValueChange,
  tabSize,
  ...props
}: CodeTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      e.currentTarget.blur();
    }

    if (e.key === "Tab") {
      e.preventDefault();

      const { selectionStart, selectionEnd } = e.currentTarget;

      const newCode =
        value.substring(0, selectionStart) +
        " ".repeat(tabSize) +
        value.substring(selectionEnd);

      if (textareaRef.current !== null) {
        textareaRef.current.value = newCode;
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
          selectionStart + tabSize;
      }

      onValueChange(newCode);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onValueChange(e.target.value);
  }

  return (
    <textarea
      {...props}
      value={value}
      ref={textareaRef}
      // Event handlers
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      // Disable various checkings
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      data-gramm={false}
    />
  );
}

export default CodeTextArea;
