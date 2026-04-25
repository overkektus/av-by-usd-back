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
      
      <div className="p-6 space-y-7 flex-grow">
        {/* Master Switch */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#dee4e9] shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3.5">
            <div className={cn(
              "p-2.5 rounded-xl transition-all duration-500",
              isEnabled ? "bg-[#0064d2]/10 text-[#0064d2]" : "bg-[#f0f4f8] text-[#91979c]"
            )}>
              <Power className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#181a1b] leading-none mb-1">Статус расширения</p>
              <p className={cn(
                "text-[10px] uppercase tracking-wider font-bold transition-colors duration-500",
                isEnabled ? "text-[#0bb978]" : "text-[#91979c]"
              )}>
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
          "space-y-6 transition-all duration-500",
          !isEnabled && "opacity-40 pointer-events-none grayscale-[0.5] scale-[0.98]"
        )}>
          <div className="space-y-2.5">
            <Label htmlFor="currency" className="text-[10px] uppercase tracking-[0.15em] font-black text-[#91979c] ml-1">
              Валюта для пересчета
            </Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="currency" className="w-full h-12 bg-white border-[#dee4e9] hover:border-[#0064d2] focus:ring-[#0064d2]/20 transition-all rounded-xl shadow-sm text-[14px] font-semibold px-4">
                <SelectValue placeholder="Выберите валюту" />
              </SelectTrigger>
              <SelectContent side="bottom" sideOffset={8}>
                <SelectItem value="USD" className="py-3 font-medium">USD — Доллар США</SelectItem>
                <SelectItem value="EUR" className="py-3 font-medium">EUR — Евро</SelectItem>
                <SelectItem value="RUB" className="py-3 font-medium">RUB — Российский рубль</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-[#91979c] ml-1">
              Текущий курс
            </Label>
            <div className="group flex items-center justify-between bg-[#f0f4f8] px-5 py-4 rounded-2xl border border-transparent hover:border-[#dee4e9] transition-all duration-300 shadow-inner-sm">
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-display font-extrabold text-[#5f676e] tracking-tight">
                  1 {currency}
                </span>
                <div className="h-px w-4 bg-[#dee4e9] group-hover:w-6 transition-all duration-300" />
                <span className="text-[16px] font-display font-black text-[#0064d2] tracking-tight">
                  {isLoading ? (
                    <span className="text-[12px] font-bold text-[#91979c] animate-pulse">Загрузка...</span>
                  ) : rate ? (
                    `${rate.toFixed(4)} BYN`
                  ) : '---'}
                </span>
              </div>
              
              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                title="Обновить курс"
                className="p-2 hover:bg-white rounded-full transition-all text-[#91979c] hover:text-[#0064d2] disabled:opacity-50 shadow-sm hover:shadow-md border border-transparent hover:border-[#e7edf3] flex items-center justify-center bg-white/50"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle Footer */}
      <div className="px-6 py-4 bg-[#f7f9fb] border-t border-[#dee4e9] flex justify-between items-center">
        <span className="text-[9px] text-[#91979c] font-black uppercase tracking-[0.1em] opacity-60">
          v{browser.runtime.getManifest().version}
        </span>
        <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-default">
          <div className="w-1 h-1 rounded-full bg-[#0064d2]" />
          <span className="text-[9px] text-[#181a1b] font-black uppercase tracking-[0.15em]">
            AV.BY CONVERTER
          </span>
        </div>
      </div>
    </div>
  );
};


