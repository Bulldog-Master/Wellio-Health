import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Dumbbell, Loader2, MapPin } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface PlaceSuggestion {
  display_name: string;
  name: string;
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
  type: string;
  class: string;
}

interface GymNameAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: {
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

export const GymNameAutocomplete = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  className,
}: GymNameAutocompleteProps) => {
  const { t } = useTranslation(['locations']);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedValue = useDebounce(value, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedValue.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        // Search for fitness-related places
        const searchTerms = [
          `${debouncedValue} gym`,
          `${debouncedValue} fitness`,
          `${debouncedValue} crossfit`,
          `${debouncedValue} studio`,
        ];
        
        // Try searching with fitness keywords
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(debouncedValue)}&extratags=1`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );
        const data = await response.json();
        
        // Filter for relevant places (gyms, fitness centers, sports facilities)
        const relevantTypes = ['gym', 'fitness', 'sports', 'leisure', 'amenity'];
        const filtered = data.filter((place: any) => {
          const isRelevant = relevantTypes.some(type => 
            place.type?.toLowerCase().includes(type) ||
            place.class?.toLowerCase().includes(type) ||
            place.display_name?.toLowerCase().includes('gym') ||
            place.display_name?.toLowerCase().includes('fitness') ||
            place.display_name?.toLowerCase().includes('crossfit') ||
            place.display_name?.toLowerCase().includes('studio') ||
            place.display_name?.toLowerCase().includes('box') ||
            place.display_name?.toLowerCase().includes('yoga')
          );
          return isRelevant || data.length <= 3; // If few results, show all
        });

        // If no filtered results, just show top results
        setSuggestions(filtered.length > 0 ? filtered : data.slice(0, 5));
        setShowSuggestions(true);
      } catch (error) {
        console.error('Gym search error:', error);
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

  const handleSelect = (suggestion: PlaceSuggestion) => {
    const addr = suggestion.address;
    const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
    const city = addr.city || addr.town || addr.village || '';
    
    // Extract the name from display_name (usually the first part before the comma)
    const name = suggestion.name || suggestion.display_name.split(',')[0].trim();
    
    onChange(name);
    setShowSuggestions(false);

    if (onPlaceSelect) {
      onPlaceSelect({
        name: name,
        street: street,
        city: city,
        state: addr.state || '',
        country: addr.country || '',
        postalCode: addr.postcode || '',
      });
    }
  };

  const getLocationPreview = (suggestion: PlaceSuggestion) => {
    const parts = [];
    const addr = suggestion.address;
    if (addr.city || addr.town || addr.village) {
      parts.push(addr.city || addr.town || addr.village);
    }
    if (addr.state) parts.push(addr.state);
    if (addr.country) parts.push(addr.country);
    return parts.join(', ');
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder || t('locations:form.name')}
          className={cn('pl-10', className)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => {
            const name = suggestion.name || suggestion.display_name.split(',')[0].trim();
            const location = getLocationPreview(suggestion);
            return (
              <button
                key={index}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => handleSelect(suggestion)}
              >
                <div className="flex items-start gap-2">
                  <Dumbbell className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{name}</p>
                    {location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {location}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GymNameAutocomplete;
