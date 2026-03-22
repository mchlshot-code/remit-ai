'use client';

import * as React from 'react';
import { CURRENCIES, POPULAR_CURRENCIES, type Currency } from '@/config/currencies';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';
import { CURRENCY_TO_COUNTRY } from '@/lib/constants';
import { Flag } from '@/components/ui/flag';

interface CurrencyComboboxProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
  disabled?: boolean;
}

/** Non-popular currencies (everything not in the popular list) */
const OTHER_CURRENCIES: Currency[] = CURRENCIES.filter(c => !c.isPopular);

export function CurrencyCombobox({ value, onChange, label, disabled = false }: CurrencyComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const selected = CURRENCIES.find(c => c.code === value);

  return (
    <div className="flex flex-col">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger 
          render={<button />}
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            setOpen(!open);
          }}
          className="w-full h-14 px-4 rounded-2xl border bg-background font-bold text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer flex items-center gap-3 justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            {selected && (
              <>
                <Flag countryCode={CURRENCY_TO_COUNTRY[selected.code] || selected.code.slice(0, 2)} size={24} className="flex-shrink-0" />
                <span className="truncate">{selected.code}</span>
              </>
            )}
            {!selected && <span className="text-muted-foreground">Select currency</span>}
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command
            filter={(value, search) => {
              const currency = CURRENCIES.find(c => c.code === value);
              if (!currency) return 0;
              const haystack = `${currency.code} ${currency.name} ${currency.country} ${currency.flag}`.toLowerCase();
              return haystack.includes(search.toLowerCase()) ? 1 : 0;
            }}
          >
            <CommandInput placeholder="Search currency..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>No currency found.</CommandEmpty>
              <CommandGroup heading="Popular">
                {POPULAR_CURRENCIES.map(c => (
                  <CommandItem
                    key={c.code}
                    value={c.code}
                    data-checked={value === c.code}
                    onSelect={() => {
                      onChange(c.code);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <Flag countryCode={CURRENCY_TO_COUNTRY[c.code] || c.code.slice(0, 2)} size={20} className="mr-2 flex-shrink-0" />
                    <span className="font-bold">{c.code}</span>
                    <span className="text-muted-foreground ml-1">· {c.country}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="All Currencies">
                {OTHER_CURRENCIES.map(c => (
                  <CommandItem
                    key={c.code}
                    value={c.code}
                    data-checked={value === c.code}
                    onSelect={() => {
                      onChange(c.code);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <Flag countryCode={CURRENCY_TO_COUNTRY[c.code] || c.code.slice(0, 2)} size={20} className="mr-2 flex-shrink-0" />
                    <span className="font-bold">{c.code}</span>
                    <span className="text-muted-foreground ml-1">· {c.country}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
