export const format = {
  currency: (amount: number | string, decimals = 2): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  },

  crypto: (amount: number | string, symbol = '', decimals = 6): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(num);
    return symbol ? `${formatted} ${symbol}` : formatted;
  },

  percentage: (value: number | string, decimals = 2): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(decimals)}%`;
  },

  date: (date: Date | string): string => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  },

  truncate: (text: string, length = 10): string => {
    if (text.length <= length) return text;
    return `${text.substring(0, length)}...${text.substring(text.length - length)}`;
  },

  truncatePartyId: (text: string, length = 10): string => {
    const [prefix, partyId] = text.split('::');
    if (!partyId) return text;
    if (partyId.length <= length) return text;
    return `${prefix}:: ${partyId.substring(0, length)}...${partyId.substring(partyId.length - length)}`;
  },
};
