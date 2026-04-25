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
import { rateManager } from '../../api';

export const Popup: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isEnabled, setIsEnabled] = useState(true);
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCurrentRate = async (cur: Currency, force = false) => {
    setIsLoading(true);
    try {
      const val = await rateManager.fetchBestRate(cur, force);
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
    <div className="p-0 min-w-[360px] min-h-[340px] bg-slate-50 dark:bg-slate-950 shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Branded Header */}
      <div className="bg-blue-600 px-5 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
        <h1 className="text-lg font-extrabold text-white flex items-center gap-2 tracking-tight">
          <span className="bg-white text-blue-600 px-2 py-0.5 rounded-md text-xs font-black shadow-sm">AV</span>
          Конвертер цен
        </h1>
        <div className={`h-2 w-2 rounded-full animate-pulse shadow-lg ${isEnabled ? 'bg-green-400 shadow-green-400/50' : 'bg-slate-400'}`} />
      </div>
      
      <div className="p-6 space-y-6 flex-grow">
        {/* Master Switch */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
              <Power className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Статус расширения</p>
              <p className="text-[10px] text-slate-500">{isEnabled ? 'Активно и работает' : 'Временно отключено'}</p>
            </div>
          </div>
          <Switch checked={isEnabled} onCheckedChange={handleToggle} />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 ml-1">
              Валюта для пересчета
            </Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="currency" className="w-full h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all shadow-sm">
                <SelectValue placeholder="Выберите валюту" />
              </SelectTrigger>
              <SelectContent side="bottom" sideOffset={8} avoidCollisions={false}>
                <SelectItem value="USD" className="py-3">USD ($) — Доллар США</SelectItem>
                <SelectItem value="EUR" className="py-3">EUR (€) — Евро</SelectItem>
                <SelectItem value="RUB" className="py-3">RUB (₽) — Российский рубль</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rate Info */}
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Текущий курс</span>
              <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                {isLoading ? 'Загрузка...' : rate ? `1 ${currency} = ${rate.toFixed(4)} BYN` : '---'}
              </span>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              title="Обновить курс"
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-blue-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-white/50 dark:bg-black/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-auto">
        <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">Актуальные курсы валют</span>
        <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600">v2.1.0</span>
      </div>
    </div>
  );
};
