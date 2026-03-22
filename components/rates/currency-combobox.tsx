'use client';

import * as React from 'react';
import { CURRENCIES, POPULAR_CURRENCIES, type Currency } from '@/config/currencies';
import { ChevronsUpDown, Search, Check } from 'lucide-react';
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
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const selected = CURRENCIES.find(c => c.code === value);

  // Close on outside click/touch
  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  // Filter currencies by search
  const filterCurrency = (c: Currency) => {
    if (!search) return true;
    const haystack = `${c.code} ${c.name} ${c.country}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  };

  const filteredPopular = POPULAR_CURRENCIES.filter(filterCurrency);
  const filteredOther = OTHER_CURRENCIES.filter(filterCurrency);

  const handleSelect = (code: string) => {
    onChange(code);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="flex flex-col relative" ref={dropdownRef}>
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">{label}</label>
      
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
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
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-[280px] z-50 bg-popover border rounded-xl shadow-xl ring-1 ring-foreground/10 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Search */}
          <div className="p-2 pb-0">
            <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-muted/50 border border-input/30">
              <Search className="w-4 h-4 opacity-50 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search currency..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground/60"
                autoFocus
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto p-1">
            {filteredPopular.length === 0 && filteredOther.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">No currency found.</div>
            )}

            {filteredPopular.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Popular</div>
                {filteredPopular.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-muted cursor-pointer transition-colors"
                  >
                    <Flag countryCode={CURRENCY_TO_COUNTRY[c.code] || c.code.slice(0, 2)} size={20} className="mr-1 flex-shrink-0" />
                    <span className="font-bold">{c.code}</span>
                    <span className="text-muted-foreground ml-1">· {c.country}</span>
                    {value === c.code && <Check className="ml-auto w-4 h-4 text-emerald-500" />}
                  </button>
                ))}
              </div>
            )}

            {filteredPopular.length > 0 && filteredOther.length > 0 && (
              <div className="-mx-1 my-1 h-px bg-border" />
            )}

            {filteredOther.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">All Currencies</div>
                {filteredOther.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-muted cursor-pointer transition-colors"
                  >
                    <Flag countryCode={CURRENCY_TO_COUNTRY[c.code] || c.code.slice(0, 2)} size={20} className="mr-1 flex-shrink-0" />
                    <span className="font-bold">{c.code}</span>
                    <span className="text-muted-foreground ml-1">· {c.country}</span>
                    {value === c.code && <Check className="ml-auto w-4 h-4 text-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
