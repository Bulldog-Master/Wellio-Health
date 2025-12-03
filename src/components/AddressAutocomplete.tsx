import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface AddressSuggestion {
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

export const AddressAutocomplete = ({
  value,
  onChange,
  onAddressSelect,
  placeholder,
  className,
}: AddressAutocompleteProps) => {
  const { t } = useTranslation(['locations']);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedValue = useDebounce(value, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedValue.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(debouncedValue)}`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Address search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: AddressSuggestion) => {
    const addr = suggestion.address;
    const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
    const city = addr.city || addr.town || addr.village || '';
    
    onChange(street || suggestion.display_name.split(',')[0]);
    setShowSuggestions(false);

    if (onAddressSelect) {
      onAddressSelect({
        street: street,
        city: city,
        state: addr.state || '',
        country: addr.country || '',
        postalCode: addr.postcode || '',
      });
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder || t('locations:form.address')}
          className={cn('pl-10', className)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-start gap-2"
              onClick={() => handleSelect(suggestion)}
            >
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <span className="line-clamp-2">{suggestion.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
