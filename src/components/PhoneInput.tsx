import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Country codes mapping
const countryCodes: Record<string, { code: string; format: string }> = {
  // North America
  'United States': { code: '+1', format: '(###) ###-####' },
  'USA': { code: '+1', format: '(###) ###-####' },
  'US': { code: '+1', format: '(###) ###-####' },
  'Canada': { code: '+1', format: '(###) ###-####' },
  'Mexico': { code: '+52', format: '## #### ####' },
  'México': { code: '+52', format: '## #### ####' },
  
  // Europe
  'United Kingdom': { code: '+44', format: '#### ######' },
  'UK': { code: '+44', format: '#### ######' },
  'Germany': { code: '+49', format: '### ########' },
  'Deutschland': { code: '+49', format: '### ########' },
  'France': { code: '+33', format: '# ## ## ## ##' },
  'Spain': { code: '+34', format: '### ### ###' },
  'España': { code: '+34', format: '### ### ###' },
  'Italy': { code: '+39', format: '### ### ####' },
  'Italia': { code: '+39', format: '### ### ####' },
  'Netherlands': { code: '+31', format: '## ### ####' },
  'Belgium': { code: '+32', format: '### ## ## ##' },
  'Portugal': { code: '+351', format: '### ### ###' },
  'Switzerland': { code: '+41', format: '## ### ## ##' },
  'Austria': { code: '+43', format: '### ######' },
  'Sweden': { code: '+46', format: '## ### ## ##' },
  'Norway': { code: '+47', format: '### ## ###' },
  'Denmark': { code: '+45', format: '## ## ## ##' },
  'Finland': { code: '+358', format: '## ### ####' },
  'Ireland': { code: '+353', format: '## ### ####' },
  'Poland': { code: '+48', format: '### ### ###' },
  
  // Asia Pacific
  'China': { code: '+86', format: '### #### ####' },
  '中国': { code: '+86', format: '### #### ####' },
  'Japan': { code: '+81', format: '##-####-####' },
  '日本': { code: '+81', format: '##-####-####' },
  'South Korea': { code: '+82', format: '##-####-####' },
  'India': { code: '+91', format: '##### #####' },
  'Australia': { code: '+61', format: '### ### ###' },
  'New Zealand': { code: '+64', format: '## ### ####' },
  'Singapore': { code: '+65', format: '#### ####' },
  'Hong Kong': { code: '+852', format: '#### ####' },
  'Taiwan': { code: '+886', format: '### ### ###' },
  'Thailand': { code: '+66', format: '## ### ####' },
  'Vietnam': { code: '+84', format: '### ### ####' },
  'Philippines': { code: '+63', format: '### ### ####' },
  'Malaysia': { code: '+60', format: '##-### ####' },
  'Indonesia': { code: '+62', format: '### ### ####' },
  
  // South America
  'Brazil': { code: '+55', format: '## #####-####' },
  'Brasil': { code: '+55', format: '## #####-####' },
  'Argentina': { code: '+54', format: '## ####-####' },
  'Colombia': { code: '+57', format: '### ### ####' },
  'Chile': { code: '+56', format: '# #### ####' },
  'Peru': { code: '+51', format: '### ### ###' },
  'Perú': { code: '+51', format: '### ### ###' },
  'Venezuela': { code: '+58', format: '### ### ####' },
  'Ecuador': { code: '+593', format: '## ### ####' },
  
  // Middle East & Africa
  'United Arab Emirates': { code: '+971', format: '## ### ####' },
  'UAE': { code: '+971', format: '## ### ####' },
  'Saudi Arabia': { code: '+966', format: '## ### ####' },
  'Israel': { code: '+972', format: '##-###-####' },
  'South Africa': { code: '+27', format: '## ### ####' },
  'Egypt': { code: '+20', format: '### ### ####' },
  'Nigeria': { code: '+234', format: '### ### ####' },
  'Kenya': { code: '+254', format: '### ######' },
  'Morocco': { code: '+212', format: '### ## ## ##' },
  
  // Russia & CIS
  'Russia': { code: '+7', format: '### ###-##-##' },
  'Россия': { code: '+7', format: '### ###-##-##' },
  'Ukraine': { code: '+380', format: '## ### ## ##' },
  'Turkey': { code: '+90', format: '### ### ## ##' },
  'Türkiye': { code: '+90', format: '### ### ## ##' },
};

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  country?: string;
  placeholder?: string;
  className?: string;
}

export const PhoneInput = ({
  value,
  onChange,
  country = '',
  placeholder,
  className,
}: PhoneInputProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [countryCode, setCountryCode] = useState('');

  // Find country code when country changes
  useEffect(() => {
    if (country) {
      // Try exact match first, then partial match
      const normalizedCountry = country.trim();
      let found = countryCodes[normalizedCountry];
      
      if (!found) {
        // Try case-insensitive match
        const lowerCountry = normalizedCountry.toLowerCase();
        const matchingKey = Object.keys(countryCodes).find(
          key => key.toLowerCase() === lowerCountry || 
                 key.toLowerCase().includes(lowerCountry) ||
                 lowerCountry.includes(key.toLowerCase())
        );
        if (matchingKey) {
          found = countryCodes[matchingKey];
        }
      }

      if (found) {
        const newCode = found.code;
        setCountryCode(newCode);
        
        // If current value doesn't start with country code, prepend it
        const cleanValue = value.replace(/^\+\d+\s*/, '').trim();
        if (cleanValue && !value.startsWith(newCode)) {
          const formatted = formatPhoneNumber(cleanValue, found.format);
          const newValue = `${newCode} ${formatted}`;
          setDisplayValue(newValue);
          onChange(newValue);
        } else if (!value && newCode) {
          setDisplayValue(`${newCode} `);
        }
      }
    }
  }, [country]);

  const formatPhoneNumber = (input: string, format: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    if (!format || !digits) return digits;

    let result = '';
    let digitIndex = 0;

    for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
      if (format[i] === '#') {
        result += digits[digitIndex];
        digitIndex++;
      } else {
        result += format[i];
        // Only add separator if we have more digits
        if (digitIndex < digits.length) {
          continue;
        }
      }
    }

    // Add remaining digits if format is exhausted
    if (digitIndex < digits.length) {
      result += digits.slice(digitIndex);
    }

    return result;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // If we have a country code and user deleted it, restore it
    if (countryCode && !newValue.startsWith(countryCode)) {
      // Check if they're trying to type/edit after the country code
      const afterCode = newValue.replace(/^\+\d*\s*/, '');
      
      // Find the format for current country
      const normalizedCountry = country?.trim() || '';
      const countryInfo = Object.entries(countryCodes).find(
        ([key]) => key.toLowerCase() === normalizedCountry.toLowerCase() ||
                   key.toLowerCase().includes(normalizedCountry.toLowerCase())
      )?.[1];

      if (countryInfo) {
        const formatted = formatPhoneNumber(afterCode, countryInfo.format);
        newValue = `${countryCode} ${formatted}`;
      } else {
        newValue = `${countryCode} ${afterCode}`;
      }
    } else if (countryCode) {
      // Format the part after country code
      const afterCode = newValue.slice(countryCode.length).replace(/^\s+/, '');
      
      const normalizedCountry = country?.trim() || '';
      const countryInfo = Object.entries(countryCodes).find(
        ([key]) => key.toLowerCase() === normalizedCountry.toLowerCase() ||
                   key.toLowerCase().includes(normalizedCountry.toLowerCase())
      )?.[1];

      if (countryInfo) {
        const formatted = formatPhoneNumber(afterCode, countryInfo.format);
        newValue = `${countryCode} ${formatted}`;
      }
    }

    setDisplayValue(newValue);
    onChange(newValue);
  };

  return (
    <Input
      type="tel"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder || (countryCode ? `${countryCode} ` : '')}
      className={cn(className)}
    />
  );
};

export default PhoneInput;
