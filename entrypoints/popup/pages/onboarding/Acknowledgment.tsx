import { useState } from 'react';
import { ArrowLeftIcon, CheckIcon } from 'lucide-react';

interface Props {
  onNext: () => void;
  onBack: () => void;
  isLocalnet?: boolean;
}

const CHECKS = [
  'I understand that I am fully responsible for keeping my private key safe.',
  'I understand that if I lose my private key, my funds cannot be recovered.',
  'I understand that anyone who has my private key can access my funds.',
];

export function Acknowledgment({ onNext, onBack, isLocalnet }: Props) {
  const [checked, setChecked] = useState<boolean[]>(CHECKS.map(() => isLocalnet ?? false));

  const allChecked = checked.every(Boolean);

  const toggle = (index: number) => {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  return (
    <div className="flex flex-col h-full p-6 bg-background">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>

      <h1 className="text-xl font-bold text-foreground mb-2">Security Acknowledgment</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Please confirm you understand the following.
      </p>

      <div className="space-y-4 flex-1">
        {CHECKS.map((text, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="w-full flex items-start gap-3 text-left rounded-xl bg-secondary p-4 hover:bg-accent transition-colors"
          >
            <div
              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                checked[i] ? 'bg-primary border-primary' : 'border-muted-foreground'
              }`}
            >
              {checked[i] && <CheckIcon className="w-3 h-3 text-primary-foreground" />}
            </div>
            <span className="text-sm text-foreground">{text}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!allChecked}
        className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-medium disabled:opacity-40 transition-opacity"
      >
        Continue
      </button>
    </div>
  );
}
