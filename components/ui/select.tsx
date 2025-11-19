import * as React from "react"

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(value);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { value: internalValue, onValueChange: handleChange });
        }
        return child;
      })}
    </div>
  );
}

export function SelectTrigger({ children, ...props }: any) {
  return (
    <button
      type="button"
      className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export function SelectValue({ placeholder, ...props }: any) {
  const value = (props as any).value;
  return <span>{value || placeholder || 'Select...'}</span>;
}

export function SelectContent({ children, ...props }: any) {
  return (
    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
      {children}
    </div>
  );
}

export function SelectItem({ value, children, ...props }: any) {
  const onValueChange = (props as any).onValueChange;
  
  return (
    <div
      className="relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm hover:bg-purple-100 focus:bg-purple-100"
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </div>
  );
}
