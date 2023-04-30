import React from "react";

type EnhancedTextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

function EnhancedTextArea({ ...props }: EnhancedTextAreaProps) {
  return (
    <textarea
      {...props}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      data-gramm={false}
    />
  );
}

export default EnhancedTextArea;
