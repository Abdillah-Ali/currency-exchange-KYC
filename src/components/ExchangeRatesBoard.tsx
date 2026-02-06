import { useState, useEffect } from 'react';
import { currencies as mockCurrencies, formatNumber } from '@/lib/mockData';
import { StatusBadge } from './StatusBadge';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export function ExchangeRatesBoard() {
  const [rates, setRates] = useState<any[]>(mockCurrencies);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/admin/inventory');
      if (response.ok) {
        const data = await response.json();
        // Map backend naming to frontend expectations if different
        const mapped = data.map((c: any) => ({
          ...c,
          // DB has flag_emoji, frontend expects flag
          flag: c.flag_emoji || '🏳️',
          buyRate: parseFloat(c.buy_rate),
          sellRate: parseFloat(c.sell_rate),
          buyAvailable: c.is_available ? 'available' : 'unavailable',
          sellAvailable: (c.is_available && parseFloat(c.stock_amount) > 0) ? 'available' : 'unavailable',
        }));
        setRates(mapped);
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.error('Fetch rates error:', e);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="bg-card rounded-xl border shadow-soft overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Today's Exchange Rates</h3>
          <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
            <RefreshCw className="h-4 w-4" />
            <span>Updated: {format(lastUpdate, 'HH:mm')}</span>
          </div>
        </div>
        <p className="text-sm text-primary-foreground/70 mt-1">Base Currency: TZS (Tanzanian Shilling)</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Currency</th>
              <th className="text-right p-3 font-medium text-muted-foreground">We Buy</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Buy Status</th>
              <th className="text-right p-3 font-medium text-muted-foreground">We Sell</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Sell Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rates.map((currency) => (
              <tr key={currency.code} className="hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currency.flag}</span>
                    <div>
                      <p className="font-medium text-foreground">{currency.code}</p>
                      <p className="text-sm text-muted-foreground">{currency.name}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <span className="font-semibold text-foreground">{formatNumber(currency.buyRate)}</span>
                </td>
                <td className="p-3 text-center">
                  <StatusBadge status={currency.buyAvailable} size="sm" />
                </td>
                <td className="p-3 text-right">
                  <span className="font-semibold text-foreground">{formatNumber(currency.sellRate)}</span>
                </td>
                <td className="p-3 text-center">
                  <StatusBadge status={currency.sellAvailable} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
