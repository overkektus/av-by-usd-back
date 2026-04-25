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
import { Switch } from '../../components/ui/switch';
import { RefreshCw, Power } from 'lucide-react';
import { cn, withMinDelay } from '../../lib/utils';
import { rateManager } from '../../api';

const MIN_LOADING_MS = 400;

export const Popup: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isEnabled, setIsEnabled] = useState(true);
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCurrentRate = async (cur: Currency, force = false) => {
    setIsLoading(true);
    try {
      const val = await withMinDelay(rateManager.fetchBestRate(cur, force), MIN_LOADING_MS);
      setRate(val);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    browser.storage.local.get(['targetCurrency', 'isEnabled']).then((res) => {
      if (res.targetCurrency) setCurrency(res.targetCurrency as Currency);
      if (res.isEnabled !== undefined) setIsEnabled(!!res.isEnabled);
      
      const currentCur = (res.targetCurrency as Currency) || 'USD';
      fetchCurrentRate(currentCur);
    });
  }, []);

  const handleCurrencyChange = async (val: string) => {
    const newCurrency = val as Currency;
    setCurrency(newCurrency);
    await browser.storage.local.set({ targetCurrency: newCurrency });
    fetchCurrentRate(newCurrency);
  };

  const handleToggle = async (checked: boolean) => {
    setIsEnabled(checked);
    await browser.storage.local.set({ isEnabled: checked });
  };

  const handleRefresh = () => fetchCurrentRate(currency, true);

  return (
    <div className="p-0 min-w-[360px] min-h-[340px] bg-[#f7f9fb] shadow-2xl rounded-xl overflow-hidden border border-[#dee4e9] flex flex-col">
      {/* Branded Header */}
      <div className="bg-[#0064d2] px-5 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
        <h1 className="text-lg font-extrabold text-white flex items-center gap-2 tracking-tight">
          <span className="bg-white text-[#0064d2] px-2 py-0.5 rounded-md text-xs font-black shadow-sm">AV.BY</span>
          Конвертер цен
        </h1>
        <div className={`h-2 w-2 rounded-full animate-pulse shadow-lg ${isEnabled ? 'bg-[#0bb978] shadow-[#0bb978]/50' : 'bg-[#aeb3b8]'}`} />
      </div>
      
      <div className="p-6 space-y-6 flex-grow">
        {/* Master Switch */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#dee4e9] shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEnabled ? 'bg-[#6ebdeb]/20 text-[#0064d2]' : 'bg-[#f0f4f8] text-[#91979c]'}`}>
              <Power className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#181a1b]">Статус расширения</p>
              <p className="text-[10px] text-[#777d82] uppercase tracking-wider font-semibold">
                {isEnabled ? 'Активно' : 'Выключено'}
              </p>
            </div>
          </div>
          <Switch 
            checked={isEnabled} 
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-[#0bb978]"
          />
        </div>

        {/* Configuration */}
        <div className={cn(
          "space-y-5 transition-all duration-300",
          !isEnabled && "opacity-40 pointer-events-none grayscale-[0.5]"
        )}>
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-[10px] uppercase tracking-widest font-bold text-[#777d82] ml-1">
              Валюта для пересчета
            </Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="currency" className="w-full h-12 bg-background border-input hover:border-primary transition-all shadow-sm text-foreground">
                <SelectValue placeholder="Выберите валюту" />
              </SelectTrigger>
              <SelectContent side="bottom" sideOffset={8}>
                <SelectItem value="USD" className="py-3 font-medium">USD — Доллар США</SelectItem>
                <SelectItem value="EUR" className="py-3 font-medium">EUR — Евро</SelectItem>
                <SelectItem value="RUB" className="py-3 font-medium">RUB — Российский рубль</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rate Info */}
          <div className="flex items-center justify-between px-1 bg-[#f0f4f8] p-3 rounded-lg border border-transparent hover:border-[#dee4e9] transition-all">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#91979c] mb-1">
                Текущий курс
              </span>
              <span className="text-sm font-mono font-bold text-[#181a1b]">
                {isLoading ? 'Загрузка...' : rate ? `1 ${currency} = ${rate.toFixed(4)} BYN` : '---'}
              </span>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              title="Обновить курс"
              className="p-2 hover:bg-white rounded-full transition-all text-[#91979c] hover:text-[#0064d2] disabled:opacity-50 shadow-sm hover:shadow-md border border-transparent hover:border-[#e7edf3]"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Subtle Footer */}
      <div className="px-6 py-3 bg-[#f0f4f8] border-t border-[#dee4e9] flex justify-center">
        <p className="text-[9px] text-[#91979c] font-medium uppercase tracking-[0.2em]">
          Powered by AV.BY Price Converter
        </p>
      </div>
    </div>
  );
};


