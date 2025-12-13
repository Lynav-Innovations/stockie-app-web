import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrencyInput } from '@/utils/formatters';

export const CurrencyInput = ({ 
  label, 
  value = 0, 
  onChange, 
  placeholder = "0,00",
  disabled = false,
  required = false,
  className = ""
}) => {
  const [displayValue, setDisplayValue] = useState(
    value > 0 ? formatCurrencyInput(String(Math.round(value * 100))).replace('R$', '').trim() : ''
  );

  useEffect(() => {
    setDisplayValue(
      value > 0 ? formatCurrencyInput(String(Math.round(value * 100))).replace('R$', '').trim() : ''
    );
  }, [value]);

  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    const newDigits = rawValue.replace(/\D/g, '');

    if (newDigits === '') {
      setDisplayValue('');
      onChange(0);
    } else {
      const formatted = formatCurrencyInput(newDigits);
      setDisplayValue(formatted.replace('R$', '').trim());
      const numericValue = parseInt(newDigits, 10) / 100;
      onChange(numericValue);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-muted-foreground font-medium text-sm">
          R$
        </span>
        <Input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`pl-10 text-right font-semibold ${className}`}
        />
      </div>
    </div>
  );
};
