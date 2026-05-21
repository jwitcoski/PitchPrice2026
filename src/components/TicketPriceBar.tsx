import type { TicketRange } from '../types';

interface Props {
  ticket: TicketRange;
  demoReveal?: boolean;
}

export function TicketPriceBar({ ticket, demoReveal }: Props) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: ticket.currency,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="ticket-block">
      <div className="ticket-labels">
        <span>From {fmt(ticket.priceMin)}</span>
        <span>Up to {fmt(ticket.priceMax)}+</span>
      </div>
      <div
        className={`ticket-bar-track ${demoReveal ? 'ticket-bar-track--demo-reveal' : ''}`}
        title={ticket.easterEgg}
      >
        <div className="ticket-bar-fill" />
        <div className="ticket-bar-tooltip">{ticket.easterEgg}</div>
      </div>
      <p className="ticket-disclaimer">{ticket.label}</p>
      <p className="ticket-tiers-heading">Example seat tiers (low → high cost)</p>
      <ul className="ticket-tiers">
        {ticket.categories.map((tier) => (
          <li key={tier}>{tier}</li>
        ))}
      </ul>
    </div>
  );
}
