import React from "react";

type EnhancedTextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

function EnhancedTextArea({ ...props }: EnhancedTextAreaProps) {
  return <textarea {...props} />;
}

export default EnhancedTextArea;
