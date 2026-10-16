import { ArrowRight } from 'lucide-react';
import { Brand } from './ui';
import RouteGlobe from './RouteGlobe';
import { routes } from '../lib/data';
export default function Welcome({
  onStart,
  onMethods,
  onImport,
}: {
  onStart: () => void;
  onMethods: () => void;
  onImport: () => void;
}) {
  return (
    <main className="welcome">
      <header className="welcome-header">
        <Brand />
        <div className="welcome-header-right">
          <span className="demo-pill">
            <span />
            Illustrative demo
          </span>
          <button className="text-button" onClick={onMethods}>
            Methods & evidence
          </button>
        </div>
      </header>
      <div className="welcome-hero">
        <div className="welcome-copy">
          <h1>Understand import risk. Decide with confidence.</h1>
          <p>
            Enter a shipment&apos;s costs and the trade conditions you are unsure about. Cost
            Current compares feasible actions in dollars.
          </p>
          <div className="button-row">
            <button className="button primary large" onClick={onStart}>
              Try an example shipment <ArrowRight size={18} />
            </button>
            <button className="button secondary large" onClick={onImport}>
              Import a CSV
            </button>
          </div>
          <p className="welcome-subcopy">
            Sample routes and prices are fictional. Nothing here is a live forecast or a customs
            ruling.
          </p>
        </div>
        <div className="welcome-world">
          <RouteGlobe routes={routes} selected="sha-lax" onSelect={onStart} />
        </div>
      </div>
      <div className="welcome-bottom">
        <div>
          <h2>Landed cost</h2>
          <p>Goods, duty, freight, and extra charges, without counting the same dollar twice.</p>
        </div>
        <div>
          <h2>Exposure</h2>
          <p>Tariff and freight possibilities priced from the assumptions you can see.</p>
        </div>
        <div>
          <h2>A comparison</h2>
          <p>Wait, order early, or a different route or supplier when the quote is comparable.</p>
        </div>
      </div>
    </main>
  );
}
