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
          <h1>See disruptions coming. Know your exposure.</h1>
          <p>
            Cost Current connects illustrative supply-chain risks to the shipments and routes you
            care about, then helps compare practical responses in dollars.
          </p>
          <div className="button-row">
            <button className="button primary large" onClick={onStart}>
              Explore supply-chain risks <ArrowRight size={18} />
            </button>
            <button className="button secondary large" onClick={onImport}>
              Import a CSV
            </button>
          </div>
          <p className="welcome-subcopy">
            Sample events, routes, and prices are fictional. Nothing here is a live forecast, market
            signal, or customs ruling.
          </p>
        </div>
        <div className="welcome-world">
          <RouteGlobe routes={routes} selected="sha-lax" onSelect={onStart} />
        </div>
      </div>
      <div className="welcome-bottom">
        <div>
          <h2>Intelligence</h2>
          <p>
            Curated demo disruptions with explicit match status and unsupported odds left blank.
          </p>
        </div>
        <div>
          <h2>Exposure</h2>
          <p>Which shipments might be affected and conditional dollars if an event occurs.</p>
        </div>
        <div>
          <h2>Decisions</h2>
          <p>Wait, order early, or a different route or supplier when the quote is comparable.</p>
        </div>
      </div>
    </main>
  );
}
