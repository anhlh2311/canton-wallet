import { useState } from 'react';
import { IncomingTab } from './IncomingTab';
import { OutgoingTab } from './OutgoingTab';
import { HistoryTab } from './HistoryTab';

type OfferTab = 'incoming' | 'outgoing' | 'history';

export function Offers() {
  const [tab, setTab] = useState<OfferTab>('incoming');

  const tabs: { id: OfferTab; label: string }[] = [
    { id: 'incoming', label: 'Incoming' },
    { id: 'outgoing', label: 'Outgoing' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'incoming' && <IncomingTab />}
        {tab === 'outgoing' && <OutgoingTab />}
        {tab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
}
