export function processPrices(usdRate: number) {
  const buttons = document.querySelectorAll('.card__price-button:not(.usd-processed)');
  
  buttons.forEach((button) => {
    button.classList.add('usd-processed');
    
    const text = button.textContent || '';
    // Extract numbers, ignoring spaces and &nbsp;
    const cleanText = text.replace(/[^\d]/g, '');
    const amountByn = parseInt(cleanText, 10);
    
    if (!isNaN(amountByn) && amountByn > 0) {
      const amountUsd = Math.round(amountByn / usdRate);
      
      // Format with spaces (e.g., 26 278 $)
      const formattedUsd = new Intl.NumberFormat('ru-RU').format(amountUsd) + ' $';
      
      const usdDiv = document.createElement('div');
      usdDiv.style.fontSize = '14px';
      usdDiv.style.color = '#707f8d'; // A typical secondary text color, adjust if needed
      usdDiv.style.marginTop = '4px';
      usdDiv.style.fontWeight = 'bold';
      usdDiv.textContent = `≈ ${formattedUsd}`;
      
      button.parentNode?.insertBefore(usdDiv, button.nextSibling);
    }
  });
}
