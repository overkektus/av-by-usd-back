import { PriceTargetConfig } from "./core/types";

export function createPriceElement(formattedValue: string, config: PriceTargetConfig): HTMLDivElement {
  const div = document.createElement('div');
  
  div.className = 'av-converted-price';
  if (config.backgroundColor) {
    div.classList.add('av-converted-price--badge');
  }

  if (config.color) {
    div.style.setProperty('--av-color', config.color);
  }
  if (config.backgroundColor) {
    div.style.setProperty('--av-bg', config.backgroundColor);
  }

  if (config.customStyle) {
    Object.assign(div.style, config.customStyle);
  }

  div.textContent = formattedValue;
  return div;
}

export function removeExistingConversion(el: HTMLElement) {
  const existing = el.parentElement?.querySelector('.av-converted-price');
  if (existing) {
    existing.remove();
  }
}
