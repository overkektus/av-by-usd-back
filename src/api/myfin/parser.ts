import { MyFinData, BankRate } from './types';
import { Currency } from '../types';

export class MyFinParser {
  static parse(html: string, currency: Currency): MyFinData {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const banks: BankRate[] = [];
    
    let defaultMultiplier = currency === 'RUB' ? 100 : 1;

    // 1. Extract individual bank rates
    const rows = doc.querySelectorAll('tr.currencies-courses__row-main[data-bank-sef-alias]');
    rows.forEach((row) => {
      const bankId = row.getAttribute('data-bank-sef-alias');
      const nameEl = row.querySelector('.bank-logo__name');
      
      // Select cells with rates
      const rateCells = row.querySelectorAll('.currencies-courses__currency-cell');
      
      if (bankId && nameEl && rateCells.length >= 2) {
        const buyRateStr = rateCells[0].querySelector('span')?.textContent?.trim() || '';
        const sellRateStr = rateCells[1].querySelector('span')?.textContent?.trim() || '';

        const calcIcon = row.querySelector('.ic-calc');
        const multiplier = calcIcon ? parseFloat(calcIcon.getAttribute('data-multiplier') || String(defaultMultiplier)) : defaultMultiplier;

        const buyRateRaw = parseFloat(buyRateStr.replace(',', '.'));
        const sellRateRaw = parseFloat(sellRateStr.replace(',', '.'));

        if (!isNaN(buyRateRaw) && !isNaN(sellRateRaw)) {
          banks.push({
            bankId,
            bankName: nameEl.textContent?.trim() || bankId,
            buyRate: buyRateRaw / multiplier,
            sellRate: sellRateRaw / multiplier
          });
        }
      }
    });

    // 2. Extract best rates from the summary block
    const bestBlock = doc.querySelector('.course-brief-info--best-courses');
    let bestBuy = 0;
    let bestSell = 0;

    if (bestBlock) {
      const bestValues = bestBlock.querySelectorAll('.accent');
      if (bestValues.length >= 2) {
        bestBuy = parseFloat(bestValues[0].textContent?.replace(/[^\d.,]/g, '').replace(',', '.') || '0') / defaultMultiplier;
        bestSell = parseFloat(bestValues[1].textContent?.replace(/[^\d.,]/g, '').replace(',', '.') || '0') / defaultMultiplier;
      }
    }

    // Fallback best rates from bank list if bestBlock failed
    if (bestBuy === 0 && banks.length > 0) {
      bestBuy = Math.max(...banks.map(b => b.buyRate));
    }
    if (bestSell === 0 && banks.length > 0) {
      bestSell = Math.min(...banks.map(b => b.sellRate));
    }

    return {
      bestBuy,
      bestSell,
      banks,
      fetchedAt: Date.now()
    };
  }
}
