import { forwardRef, TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    { label, error, hint, className = "", id, ...props },
    ref
  ) {
    const textareaId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
          >
            {label}
            {props.required && <span className="text-trust-red ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-4 py-3 rounded-lg
            border border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:ring-2 focus:ring-primary focus:border-transparent
            outline-none transition-all resize-none
            disabled:opacity-60 disabled:cursor-not-allowed
            ${error ? "border-trust-red focus:ring-trust-red" : ""}
            ${className}
          `.trim()}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-trust-red">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

export default TextArea;
