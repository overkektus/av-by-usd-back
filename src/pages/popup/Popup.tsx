import React, { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import { Currency } from '../../api/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';

export const Popup: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>('USD');

  useEffect(() => {
    browser.storage.local.get('targetCurrency').then((res) => {
      if (res.targetCurrency) {
        setCurrency(res.targetCurrency as Currency);
      }
    });
  }, []);

  const handleCurrencyChange = async (val: string) => {
    const newCurrency = val as Currency;
    setCurrency(newCurrency);
    await browser.storage.local.set({ targetCurrency: newCurrency });
  };

  return (
    <div className="p-0 min-w-[360px] min-h-[300px] bg-slate-50 dark:bg-slate-950 shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Branded Header */}
      <div className="bg-blue-600 px-5 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
        <h1 className="text-lg font-extrabold text-white flex items-center gap-2 tracking-tight">
          <span className="bg-white text-blue-600 px-2 py-0.5 rounded-md text-xs font-black shadow-sm">AV</span>
          Price Converter
        </h1>
        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" title="Active" />
      </div>
      
      <div className="p-6 space-y-5 flex-grow">
        <div className="space-y-3">
          <Label htmlFor="currency" className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 ml-1">
            Preferred Currency
          </Label>
          
          <Select value={currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger id="currency" className="w-full h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-sm">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent side="bottom" sideOffset={8} avoidCollisions={false} className="border-slate-200 dark:border-slate-800">
              <SelectItem value="USD" className="py-3">USD ($) - US Dollar</SelectItem>
              <SelectItem value="EUR" className="py-3">EUR (€) - Euro</SelectItem>
              <SelectItem value="RUB" className="py-3">RUB (₽) - Russian Ruble</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="px-6 py-4 bg-white/50 dark:bg-black/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-auto">
        <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">Live Exchange Rates</span>  
        <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600">v2.0.0</span>
      </div>
    </div>
  );
};
