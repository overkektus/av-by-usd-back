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
        <div className="flex items-center justify-between bg-white p-5 rounded-[20px] border border-[#dee4e9] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 active:scale-[0.99] group">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-2xl transition-all duration-500 transform group-hover:rotate-12",
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
        <span className="text-[9px] text-[#91979c] font-black uppercase tracking-[0.2em] opacity-40">
          v{browser.runtime.getManifest().version}
        </span>
        <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-all duration-300 cursor-default group">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0064d2] group-hover:scale-150 transition-transform" />
          <span className="text-[9px] text-[#181a1b] font-black uppercase tracking-[0.2em]">
            AV.BY CONVERTER
          </span>
        </div>
      </div>
    </div>
  );
};

export default Popup;


