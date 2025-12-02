import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface UserSearchComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const UserSearchCombobox = ({ value, onChange, placeholder }: UserSearchComboboxProps) => {
  const { t } = useTranslation(['admin', 'common']);
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .not('username', 'is', null)
        .order('username', { ascending: true })
        .limit(100);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query)
    );
  });

  const selectedUser = users.find(
    user => user.username?.toLowerCase() === value.toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{selectedUser.full_name || selectedUser.username}</span>
              {selectedUser.full_name && selectedUser.username && (
                <span className="text-muted-foreground">@{selectedUser.username}</span>
              )}
            </div>
          ) : value ? (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{value}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder || t('admin:username_placeholder')}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border shadow-lg z-50" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={t('admin:search_users')} 
            value={searchQuery}
            onValueChange={(val) => {
              setSearchQuery(val);
              onChange(val);
            }}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? t('common:loading') : t('admin:no_users_found')}
            </CommandEmpty>
            <CommandGroup>
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.username || ''}
                  onSelect={() => {
                    onChange(user.username || '');
                    setSearchQuery('');
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === user.username?.toLowerCase() 
                        ? "opacity-100" 
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user.full_name || user.username}
                    </span>
                    {user.username && (
                      <span className="text-xs text-muted-foreground">
                        @{user.username}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
