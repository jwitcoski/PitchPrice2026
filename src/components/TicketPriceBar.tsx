import type { TicketRange } from '../types';

interface Props {
  ticket: TicketRange;
}

export function TicketPriceBar({ ticket }: Props) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: ticket.currency,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="ticket-block">
      <div className="ticket-labels">
        <span>Low {fmt(ticket.priceMin)}</span>
        <span>High {fmt(ticket.priceMax)}+</span>
      </div>
      <div className="ticket-bar-track" title={ticket.easterEgg}>
        <div className="ticket-bar-fill" />
        <div className="ticket-bar-tooltip">{ticket.easterEgg}</div>
      </div>
      <p className="ticket-disclaimer">{ticket.label}</p>
      <p className="ticket-cats">{ticket.categories.join(' · ')}</p>
    </div>
  );
}
