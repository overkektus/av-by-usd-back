export const injectStyles = () => {
  if (document.getElementById('av-price-converter-styles')) return;

  const style = document.createElement('style');
  style.id = 'av-price-converter-styles';
  style.textContent = `
    @keyframes av-price-fade-in {
      from { 
        opacity: 0; 
        transform: translateY(-5px) scale(0.97); 
        filter: blur(2px);
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
        filter: blur(0);
      }
    }
    .av-converted-price {
      animation: av-price-fade-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      will-change: opacity, transform, filter;
      
      /* Base styles from converter.ts */
      font-size: 14px;
      font-weight: bold;
      margin-top: 4px;
      color: var(--av-color, #707f8d);
      display: block;
    }

    .av-converted-price--badge {
      background-color: var(--av-bg, transparent);
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
    }
  `;
  document.head.appendChild(style);
};
