import { useState, useRef } from "react";
import {
  UseFormRegister,
  FieldValues,
  Path,
  RegisterOptions,
  FieldError,
} from "react-hook-form";

interface SSInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: string;
  register: UseFormRegister<T>;
  validation?: RegisterOptions<T>;
  error?: FieldError;
  autoComplete?: string;
  autoFocus?: boolean;
}

const SSInput = <T extends FieldValues>({
  label,
  name,
  type = "text",
  placeholder,
  required,
  icon,
  register,
  validation,
  error,
  autoComplete,
  autoFocus
}: SSInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordToggleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Allow Space and Enter keys to activate the button
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      togglePasswordVisibility();
    }
  };

  const handleMouseEnter = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 300); // Show tooltip after 300ms
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(false);
  };

  return (
    <div className="w-full max-w-full flex flex-col box-border">
      <label 
        htmlFor={name} 
        className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 text-left"
      >
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      
      <div className="relative w-full max-w-full flex items-center box-border">
        {icon && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
            <i className={icon}></i>
          </span>
        )}

        <input
          type={inputType}
          id={name}
          className={`block w-full max-w-full box-border pl-8 ${
            type === "password" ? "pr-12" : "pr-3"
          } py-1.5 text-base text-gray-900 dark:text-gray-200 bg-white dark:bg-slate-800 border rounded-md sm:text-sm transition-colors ${
            error
              ? "border-red-500 focus:outline-red-500"
              : "border-gray-300 dark:border-gray-600 focus:outline-indigo-600 dark:focus:outline-indigo-400"
          }`}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...register(name, validation)}
        />

        {type === "password" && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            {/* Tooltip */}
            {showTooltip && (
              <div 
                className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
                role="tooltip"
              >
                {showPassword ? "Hide password (Space/Enter)" : "Show password (Space/Enter)"}
                <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
              </div>
            )}

            {/* Password Visibility Toggle Button */}
            <button
              type="button"
              onClick={togglePasswordVisibility}
              onKeyDown={handlePasswordToggleKeyDown}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleMouseEnter}
              onBlur={handleMouseLeave}
              className="p-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700"
              aria-label={showPassword ? `Hide ${name} password. Press Space or Enter to toggle.` : `Show ${name} password. Press Space or Enter to toggle.`}
              aria-pressed={showPassword}
              title={showPassword ? "Hide password (Space/Enter)" : "Show password (Space/Enter)"}
            >
              <i 
                className={`text-lg transition-colors ${
                  showPassword 
                    ? "fi fi-rr-eye text-indigo-600 dark:text-indigo-400" 
                    : "fi fi-rr-eye-crossed text-gray-600 dark:text-gray-300"
                }`}
                aria-hidden="true"
              ></i>
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-rose-500 mt-1.5 text-left w-full break-words overflow-hidden">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default SSInput;
