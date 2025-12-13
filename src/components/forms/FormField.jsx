import React from 'react';
import { Input } from '@/components/ui/input';

export const FormField = ({ 
  label, 
  type = 'text',
  value, 
  onChange, 
  placeholder,
  required = false,
  disabled = false,
  icon: Icon,
  mask,
  min,
  className = ""
}) => {
  const handleChange = (e) => {
    const rawValue = e.target.value;
    let maskedValue = rawValue;

    if (type === 'number' && min === '0') {
      const numValue = parseFloat(rawValue);
      if (rawValue === '') {
        maskedValue = '';
      } else if (numValue < 0) {
        maskedValue = '0';
      }
    }

    maskedValue = mask ? mask(maskedValue) : maskedValue;
    
    if (type === 'number') {
      onChange(maskedValue === '' ? 0 : parseFloat(maskedValue));
    } else {
      onChange(maskedValue);
    }
  };

  const inputValue = type === 'number' && value === 0 ? '' : value;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          type={type}
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          className={`${Icon ? 'pl-10' : ''} ${className}`}
        />
      </div>
    </div>
  );
};
