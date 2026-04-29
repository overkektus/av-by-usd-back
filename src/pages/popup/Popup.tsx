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
import { RefreshCw, Power, Landmark } from 'lucide-react';
import { cn, withMinDelay } from '../../lib/utils';
import { rateManager } from '../../api';
import { myFinService, SUPPORTED_BANKS, MyFinData } from '../../api/myfin';

const MIN_LOADING_MS = 400;

export const Popup: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedBank, setSelectedBank] = useState<string>('nbrb');
  const [myFinData, setMyFinData] = useState<MyFinData | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCurrentRate = async (cur: Currency, bankId = 'nbrb', force = false) => {
    setIsLoading(true);
    try {
      let val: number | null = null;
      
      if (bankId !== 'nbrb') {
        val = await withMinDelay(myFinService.getRateForBank(cur, bankId), MIN_LOADING_MS);
      }
      
      if (val === null) {
        val = await withMinDelay(rateManager.fetchBestRate(cur, force), MIN_LOADING_MS);
      }

      setRate(val);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyFinStatus = async (cur: Currency) => {
    const data = await myFinService.getRates(cur);
    setMyFinData(data);
  };

  useEffect(() => {
    browser.storage.local.get(['targetCurrency', 'isEnabled', 'selectedBank']).then((res) => {
      if (res.targetCurrency) setCurrency(res.targetCurrency as Currency);
      if (res.isEnabled !== undefined) setIsEnabled(!!res.isEnabled);
      if (res.selectedBank) setSelectedBank(res.selectedBank as string);
      
      const currentCur = (res.targetCurrency as Currency) || 'USD';
      const currentBank = (res.selectedBank as string) || 'nbrb';
      
      fetchCurrentRate(currentCur, currentBank);
      fetchMyFinStatus(currentCur);
    });
  }, []);

  const handleCurrencyChange = async (val: string) => {
    const newCurrency = val as Currency;
    setCurrency(newCurrency);
    await browser.storage.local.set({ targetCurrency: newCurrency });
    fetchCurrentRate(newCurrency, selectedBank);
    fetchMyFinStatus(newCurrency);
  };

  const handleBankChange = async (val: string) => {
    setSelectedBank(val);
    await browser.storage.local.set({ selectedBank: val });
    fetchCurrentRate(currency, val);
  };

  const handleToggle = async (checked: boolean) => {
    setIsEnabled(checked);
    await browser.storage.local.set({ isEnabled: checked });
  };

  const handleRefresh = () => fetchCurrentRate(currency, selectedBank, true);

  return (
    <div className="p-0 min-w-[380px] min-h-[500px] bg-[#f8fafc] shadow-2xl overflow-hidden border border-[#e2e8f0] flex flex-col">
      {/* Premium Header */}
      <div className="bg-[#0064d2] px-8 py-6 flex items-center justify-between flex-shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
        <div className="flex flex-col relative z-10">
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2 tracking-tight">
            <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-2.5 py-0.5 rounded-lg text-[12px] font-bold">AV.BY</span>
            USD Converter
          </h1>
        </div>
        <div className={cn(
          "h-2 w-2 rounded-full transition-all duration-500",
          isEnabled ? "bg-[#10b981] shadow-[0_0_12px_#10b981]" : "bg-white/20"
        )} />
      </div>
      
      <div className="px-8 py-6 space-y-4 flex-grow overflow-y-auto">
        {/* Modern Status Toggle */}
        <div className={cn(
          "flex items-center justify-between p-3 rounded-2xl border transition-all duration-300",
          isEnabled ? "bg-[#e0efff] border-[#0064d2]/20 shadow-sm" : "bg-slate-50 border-transparent opacity-60"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2.5 rounded-xl transition-colors",
              isEnabled ? "bg-[#0064d2]/5 text-[#0064d2]" : "bg-slate-200 text-slate-400"
            )}>
              <Power className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <p className="text-[14px] font-bold text-slate-900">Статус расширения</p>
              <p className={cn(
                "text-[12px] font-medium",
                isEnabled ? "text-[#10b981]" : "text-slate-500"
              )}>
                {isEnabled ? 'Включено' : 'Выключено'}
              </p>
            </div>
          </div>
          <Switch 
            checked={isEnabled} 
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-[#10b981]"
          />
        </div>

        {/* Configuration Sections */}
        <div className={cn(
          "flex flex-col flex-grow transition-all duration-500",
          !isEnabled && "opacity-40 pointer-events-none blur-[1px] scale-[0.98]"
        )}>
          <div className="space-y-4">
            {/* Currency Section */}
            <div className="space-y-1.5">
              <Label htmlFor="currency" className="text-[12px] font-semibold text-slate-600 ml-1">
                Целевая валюта
              </Label>
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger id="currency" className="w-full h-12 bg-white border-[#e2e8f0] hover:border-[#0064d2] focus:ring-4 focus:ring-[#0064d2]/5 transition-all rounded-2xl shadow-sm text-[15px] font-bold px-5">
                  <SelectValue placeholder="Выберите валюту" />
                </SelectTrigger>
                <SelectContent side="bottom" sideOffset={8} avoidCollisions={false} className="rounded-2xl border-[#e2e8f0] shadow-2xl p-1.5">
                  <SelectItem value="USD" className="py-3 font-bold focus:bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🇺🇸</span>
                      <span className="text-[14px]">USD — Доллар США</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="EUR" className="py-3 font-bold focus:bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🇪🇺</span>
                      <span className="text-[14px]">EUR — Евро</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="RUB" className="py-3 font-bold focus:bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🇷🇺</span>
                      <span className="text-[14px]">RUB — Рос. рубль</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bank Selection Section */}
            {myFinData && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-500">
                <Label htmlFor="bank" className="text-[12px] font-semibold text-slate-600 ml-1 flex items-center gap-2">
                  <Landmark className="h-3.5 w-3.5 opacity-60" />
                  Источник курса
                </Label>
                <Select value={selectedBank} onValueChange={handleBankChange}>
                  <SelectTrigger id="bank" className="w-full h-12 bg-white border-[#e2e8f0] hover:border-[#0064d2] focus:ring-4 focus:ring-[#0064d2]/5 transition-all rounded-2xl shadow-sm text-[15px] font-bold px-5">
                    <SelectValue placeholder="Выберите банк" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" sideOffset={8} avoidCollisions={false} className="rounded-2xl border-[#e2e8f0] shadow-2xl max-h-[220px] w-[var(--radix-select-trigger-width)] p-1.5">
                    <SelectItem value="nbrb" className="py-2.5 font-bold focus:bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🏦</span>
                        <span className="text-[14px]">НБРБ (Официальный)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="best" className="py-2.5 font-bold focus:bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">⭐</span>
                          <span className="text-[14px] text-[#10b981]">Лучший в банках</span>
                        </div>
                        <span className="text-[12px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded-lg">
                          {myFinData.bestSell.toFixed(4)}
                        </span>
                      </div>
                    </SelectItem>
                    <div className="h-px bg-slate-100 my-2 mx-1" />
                    {SUPPORTED_BANKS.filter(b => b.enabled).map(bank => {
                      const bankData = myFinData.banks.find(bd => bd.bankId === bank.id);
                      return (
                        <SelectItem key={bank.id} value={bank.id} className="py-2.5 font-bold focus:bg-slate-50 rounded-xl">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[13.5px] font-semibold text-slate-700">{bank.name}</span>
                            {bankData && (
                              <span className="text-[12px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                                {bankData.sellRate.toFixed(4)}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Current Rate Card */}
          <div className="space-y-1.5 pt-8 border-t border-slate-100">
            <Label className="text-[12px] font-semibold text-slate-600 ml-1">
              Актуальный курс
            </Label>
            <div className="group flex items-center justify-between bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm transition-all relative overflow-hidden">
              <div className="flex items-center gap-4 relative z-10">
                <span className="text-[16px] font-bold text-slate-400">1 {currency}</span>
                <div className="h-0.5 w-4 bg-slate-200 rounded-full group-hover:w-6 group-hover:bg-[#0064d2]/20 transition-all" />
                <span className={cn(
                  "text-[20px] font-display font-bold tracking-tight transition-all",
                  isLoading ? "text-slate-300 blur-[2px]" : "text-[#0064d2]"
                )}>
                  {rate ? `${rate.toFixed(4)} BYN` : '---'}
                </span>
              </div>
              
              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2.5 bg-white rounded-xl transition-all text-slate-400 hover:text-[#0064d2] shadow-sm hover:shadow-md border border-transparent hover:border-[#e2e8f0] active:scale-95"
              >
                <RefreshCw className={cn("h-4.5 w-4.5", isLoading && "animate-spin")} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Minimal Footer */}
      <div className="px-8 py-5 bg-[#f8fafc] border-t border-[#dee4e9] flex justify-between items-center">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
          v{browser.runtime.getManifest().version}
        </span>

        <button 
          onClick={() => browser.tabs.create({ url: 'https://github.com/overkektus/av-by-usd-back' })}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-400 hover:text-[#0064d2] hover:bg-slate-50 transition-all text-[12px] font-bold"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          GitHub
        </button>
      </div>
    </div>
  );
};

export default Popup;


