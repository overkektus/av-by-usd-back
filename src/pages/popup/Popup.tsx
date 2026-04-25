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
  const [displayRate, setDisplayRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCurrentRate = async (cur: Currency, force = false) => {
    setIsLoading(true);
    try {
      const val = await withMinDelay(rateManager.fetchBestRate(cur, force), MIN_LOADING_MS);
      setRate(val);
      if (displayRate === null) {
        setDisplayRate(val);
      } else {
        setDisplayRate(val); 
      }
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
    <div className="p-0 min-w-[380px] min-h-[360px] bg-[#f7f9fb] shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[24px] overflow-hidden border border-[#dee4e9] flex flex-col transition-all duration-500">
      {/* Branded Header */}
      <div className="bg-[#0064d2] px-6 py-5 flex items-center justify-between shadow-[0_4px_12px_rgba(0,100,210,0.2)] flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
        <h1 className="text-xl font-display font-black text-white flex items-center gap-2.5 tracking-tight relative z-10">
          <span className="bg-white text-[#0064d2] px-2.5 py-1 rounded-lg text-[11px] font-black shadow-[0_2px_8px_rgba(0,0,0,0.1)]">AV.BY</span>
          Конвертер цен
        </h1>
        <div className={cn(
          "h-2.5 w-2.5 rounded-full transition-all duration-500 relative z-10",
          isEnabled ? "bg-[#0bb978] shadow-[0_0_12px_#0bb978]" : "bg-white/30 shadow-none"
        )} />
      </div>
      
      <div className="p-7 space-y-8 flex-grow relative">
        {/* Master Switch */}
        <div className="flex items-center justify-between bg-white p-5 rounded-[20px] border border-[#dee4e9] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 active:scale-[0.99]">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-2xl transition-all duration-500",
              isEnabled ? "bg-[#0064d2]/10 text-[#0064d2]" : "bg-[#f0f4f8] text-[#91979c]"
            )}>
              <Power className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#181a1b] leading-none mb-1.5">Статус расширения</p>
              <p className={cn(
                "text-[10px] uppercase tracking-[0.2em] font-black transition-colors duration-500",
                isEnabled ? "text-[#0bb978]" : "text-[#91979c]"
              )}>
                {isEnabled ? 'Активно' : 'Выключено'}
              </p>
            </div>
          </div>
          <Switch 
            checked={isEnabled} 
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-[#0bb978] scale-110"
          />
        </div>

        {/* Configuration */}
        <div className={cn(
          "space-y-7 transition-all duration-700",
          !isEnabled && "opacity-30 pointer-events-none grayscale blur-[2px] scale-[0.97]"
        )}>
          <div className="space-y-3">
            <Label htmlFor="currency" className="text-[10px] uppercase tracking-[0.2em] font-black text-[#91979c] ml-1.5">
              Валюта для пересчета
            </Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="currency" className="w-full h-14 bg-white border-[#dee4e9] hover:border-[#0064d2] focus:ring-4 focus:ring-[#0064d2]/10 transition-all rounded-[18px] shadow-sm text-[15px] font-bold px-5">
                <SelectValue placeholder="Выберите валюту" />
              </SelectTrigger>
              <SelectContent side="bottom" sideOffset={10} className="rounded-xl border-[#dee4e9] shadow-xl">
                <SelectItem value="USD" className="py-3.5 font-bold focus:bg-[#0064d2]/5 focus:text-[#0064d2]">USD — Доллар США</SelectItem>
                <SelectItem value="EUR" className="py-3.5 font-bold focus:bg-[#0064d2]/5 focus:text-[#0064d2]">EUR — Евро</SelectItem>
                <SelectItem value="RUB" className="py-3.5 font-bold focus:bg-[#0064d2]/5 focus:text-[#0064d2]">RUB — Российский рубль</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#91979c] ml-1.5">
              Текущий курс
            </Label>
            <div className="group flex items-center justify-between bg-[#f0f4f8] px-6 py-5 rounded-[22px] border border-transparent hover:border-[#dee4e9] transition-all duration-500 shadow-inner-sm relative overflow-hidden">
              <div className="flex items-center gap-4 relative z-10">
                <span className="text-[16px] font-display font-black text-[#5f676e] tracking-tight">
                  1 {currency}
                </span>
                <div className="h-0.5 w-5 bg-[#dee4e9] rounded-full group-hover:w-8 group-hover:bg-[#0064d2]/30 transition-all duration-500" />
                <div className="flex flex-col">
                  <span className={cn(
                    "text-[18px] font-display font-black tracking-tight transition-all duration-500",
                    isLoading ? "text-[#91979c] blur-[1px]" : "text-[#0064d2]"
                  )}>
                    {rate ? `${rate.toFixed(4)} BYN` : '---'}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                title="Обновить курс"
                className="p-2.5 bg-white rounded-full transition-all text-[#91979c] hover:text-[#0064d2] disabled:opacity-50 shadow-sm hover:shadow-lg active:scale-90 border border-transparent hover:border-[#e7edf3] flex items-center justify-center relative z-10"
              >
                <RefreshCw className={cn("h-4.5 w-4.5 transition-all duration-700", isLoading && "animate-spin scale-110")} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle Footer */}
      <div className="px-7 py-5 bg-[#f7f9fb] border-t border-[#dee4e9] flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 cursor-default">
            <div className="w-1 h-1 rounded-full bg-[#0064d2] opacity-40" />
            <span className="text-[10px] text-[#181a1b] font-black uppercase tracking-[0.1em] opacity-40">
              USD Converter for av.by
            </span>
          </div>
          <span className="text-[8px] text-[#91979c] font-bold uppercase tracking-[0.2em] opacity-40 ml-2.5">
            v{browser.runtime.getManifest().version}
          </span>
        </div>

        <button 
          onClick={() => browser.tabs.create({ url: 'https://github.com/overkektus/av-by-usd-back' })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#dee4e9] hover:border-[#0064d2] hover:text-[#0064d2] text-[#91979c] transition-all shadow-sm hover:shadow-md active:scale-95 group"
        >
          <svg className="h-3 w-3 fill-current transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">GitHub</span>
        </button>
      </div>
    </div>
  );
};

export default Popup;


