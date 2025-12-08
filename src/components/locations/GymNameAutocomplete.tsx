import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Dumbbell, Loader2, MapPin, Database, Globe } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface PlaceSuggestion {
  id?: string;
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
  phone?: string;
  website_url?: string;
  source: 'database' | 'external';
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
    phone?: string;
    website?: string;
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
        // First, search local database for existing locations
        const { data: dbResults } = await supabase
          .from('fitness_locations')
          .select('id, name, address, city, state, country, postal_code, phone, website_url')
          .ilike('name', `%${debouncedValue}%`)
          .eq('is_active', true)
          .limit(5);

        const dbSuggestions: PlaceSuggestion[] = (dbResults || []).map(loc => ({
          id: loc.id,
          display_name: `${loc.name}, ${loc.city}, ${loc.country}`,
          name: loc.name,
          address: {
            road: loc.address || '',
            city: loc.city,
            state: loc.state || '',
            country: loc.country,
            postcode: loc.postal_code || '',
          },
          phone: loc.phone || '',
          website_url: loc.website_url || '',
          source: 'database' as const,
        }));

        // Also search external API for additional results
        let externalSuggestions: PlaceSuggestion[] = [];
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(debouncedValue + ' gym')}&extratags=1`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          );
          const data = await response.json();
          
          externalSuggestions = data
            .filter((place: any) => {
              const displayLower = place.display_name?.toLowerCase() || '';
              return displayLower.includes('gym') ||
                displayLower.includes('fitness') ||
                displayLower.includes('crossfit') ||
                displayLower.includes('yoga') ||
                displayLower.includes('sport');
            })
            .slice(0, 3)
            .map((place: any) => ({
              display_name: place.display_name,
              name: place.name || place.display_name.split(',')[0].trim(),
              address: place.address || {},
              source: 'external' as const,
            }));
        } catch {
          // External API failed, continue with database results only
        }

        // Combine results - database first, then external
        const combined = [...dbSuggestions, ...externalSuggestions];
        setSuggestions(combined);
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
    const street = suggestion.source === 'database' 
      ? (addr.road || '') 
      : [addr.house_number, addr.road].filter(Boolean).join(' ');
    const city = addr.city || addr.town || addr.village || '';
    
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
        phone: suggestion.phone || '',
        website: suggestion.website_url || '',
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

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((suggestion, index) => {
                const name = suggestion.name || suggestion.display_name.split(',')[0].trim();
                const location = getLocationPreview(suggestion);
                const isFromDb = suggestion.source === 'database';
                return (
                  <button
                    key={`${suggestion.source}-${index}`}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => handleSelect(suggestion)}
                  >
                    <div className="flex items-start gap-2">
                      {isFromDb ? (
                        <Database className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                      ) : (
                        <Globe className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{name}</p>
                        {location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            {location}
                          </p>
                        )}
                        {isFromDb && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {t('locations:verified', 'Already registered')}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          ) : !isLoading && value.length >= 2 ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              <p className="font-medium">{t('locations:no_autocomplete_results', 'No matches found')}</p>
              <p className="text-xs mt-1">{t('locations:manual_entry_hint', 'You can type the name manually and fill in the address below')}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GymNameAutocomplete;
