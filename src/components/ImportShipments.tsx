import { useRef, useState } from 'react';
import { ArrowLeft, Download, FileUp, ShieldCheck } from 'lucide-react';
import { commitImport, MAX_CSV_BYTES, MAX_SHIPMENTS, previewCsv, sampleCsv, type CsvPreview } from '../lib/csv';
import { analyzeShipment, decisionDate } from '../lib/engine';
import { dateLabel, usd } from '../lib/format';
import type { Shipment } from '../lib/types';
import { Eyebrow, Field, SectionHeading } from './ui';

export default function ImportShipments({ shipments, onCommit, onBack }: { shipments: Shipment[]; onCommit: (next: Shipment[], ids: string[]) => void; onBack: () => void }) {
  const [text, setText] = useState(''), [fileName, setFileName] = useState('Pasted CSV'), [preview, setPreview] = useState<CsvPreview | null>(null);
  const [error, setError] = useState(''), [confirmed, setConfirmed] = useState(false), [reading, setReading] = useState(false);
  const request = useRef(0);
  const invalid = !preview || preview.errors.length > 0 || preview.rows.length === 0 || preview.rows.some(row => row.errors.length > 0);
  const replaceText = (value: string, name: string) => { setText(value); setFileName(name); setPreview(null); setConfirmed(false); setError(''); };
  const download = () => {
    const url = URL.createObjectURL(new Blob([sampleCsv()], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'cost-current-shipment-template.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const readFile = async (file: File) => {
    const currentRequest = ++request.current;
    setPreview(null); setConfirmed(false); setError('');
    if (file.size > MAX_CSV_BYTES || !file.name.toLowerCase().endsWith('.csv')) { setError('Choose a .csv file no larger than 1 MB.'); return; }
    setReading(true);
    try { const contents = await file.text(); if (request.current === currentRequest) replaceText(contents, file.name); }
    catch { if (request.current === currentRequest) setError('This file could not be read. Try pasting the CSV text.'); }
    finally { if (request.current === currentRequest) setReading(false); }
  };
  const inspect = () => { setPreview(previewCsv(text, shipments, { fileName, capturedAt: new Date().toISOString() })); setConfirmed(false); setError(''); };
  const commit = () => {
    if (!preview || !confirmed) return;
    const result = commitImport(preview, shipments);
    if (result.error) { setError(result.error); return; }
    onCommit(result.shipments, preview.rows.map(row => row.shipment!.id));
  };
  return <>
    <div className="page-heading"><div><Eyebrow>QUOTE-BACKED SHIPMENT INTAKE</Eyebrow><h1>Start with the numbers you have.</h1><p>Preview every row before adding it. Files are processed locally in this browser.</p></div><button className="button secondary" onClick={onBack}><ArrowLeft size={15} /> Back to overview</button></div>
    <section className="panel import-panel"><SectionHeading number="01" title="Use a clear template" description="USD only. Probabilities are entered as percentages (40 means 40%). No automatic currency or tariff lookup." action={<button className="button secondary" onClick={download}><Download size={15} /> Download sample CSV</button>} />
      <p className="import-guidance">Supported route IDs: <code>sha-lax</code> (Shanghai → Los Angeles), <code>hph-sav</code> (Haiphong → Savannah), <code>ham-ewr</code> (Hamburg → Newark). Your country-of-origin field stays separate from routing.</p>
      <p className="import-guidance">Use <code>scenario_assumption</code> for fictional examples or <code>customer_supplied</code> for inputs you provide with a source reference and date. Imported costs are never labeled independently verified. All event probabilities are hypothetical assumptions.</p>
      <p className="import-guidance">Insurance, brokerage, port and inland columns are optional additional charges. Omitted categories are outside the modeled scope. If a charge is already in goods/freight, leave its optional column blank and record its inclusion in the shipment editor after import.</p>
      <div className="import-actions"><label className="file-picker"><FileUp size={18} /><span>Choose CSV file</span><input aria-label="Shipment CSV file" type="file" accept=".csv,text/csv" disabled={reading} onChange={e => { const file = e.target.files?.[0]; if (file) void readFile(file); e.target.value = ''; }} /></label><button className="text-button" onClick={() => replaceText(sampleCsv(), 'Fictional sample CSV')}>Use fictional sample</button><span className="quiet-caption">{MAX_SHIPMENTS - shipments.length} spaces remaining · 1 MB maximum</span></div>
      <Field label="CSV contents" hint="Plain numbers only, no currency signs or thousands separators. Use the template headers; invalid rows block the entire import."><textarea aria-label="CSV contents" rows={8} value={text} maxLength={MAX_CSV_BYTES} onChange={e => { request.current++; setReading(false); replaceText(e.target.value, 'Pasted CSV'); }} spellCheck={false} /></Field>
      <button className="button primary" disabled={!text.trim() || reading} onClick={inspect}>Preview shipments</button>
      {error && <div className="notice" role="alert">{error}</div>}
    </section>
    {preview && <section className="panel import-panel" data-testid="import-preview"><SectionHeading number="02" title="Review before importing" description={`${preview.rows.length} parsed rows. Existing shipments are never overwritten.`} />
      {preview.errors.length > 0 && <div className="notice" role="alert"><ul>{preview.errors.map(e => <li key={e}>{e}</li>)}</ul></div>}
      <div className="ledger-scroll"><table className="import-table" aria-label="Shipment import preview"><thead><tr><th>CSV line</th><th>Shipment</th><th>Base cost</th><th>Evidence / status</th></tr></thead><tbody>{preview.rows.map(row => {
        const analysis = row.shipment ? analyzeShipment(row.shipment) : null;
        return <tr key={row.line}><td>{row.line}</td><td>{row.shipment?.name ?? 'Needs correction'}<small>{row.shipment?.id}</small>{row.shipment&&<small>Decision date: {dateLabel(decisionDate(row.shipment))}</small>}</td><td>{analysis?.valid ? usd(analysis.baseCents, 2) : 'Not calculated'}</td><td>{row.errors.length ? <ul className="import-errors">{row.errors.map(e => <li key={e}>{e}</li>)}</ul> : <><strong>{row.shipment?.intake?.sourceType === 'customer_supplied' ? 'Customer supplied · not independently verified' : 'Illustrative assumptions'}</strong><small>Valid input shape; no classification or quote verification</small></>}</td></tr>;
      })}</tbody></table></div>
      <label className="checkbox-label"><input type="checkbox" checked={confirmed} disabled={invalid} onChange={e => setConfirmed(e.target.checked)} />I have itemized goods, duty and freight. Optional charge columns are additional and are not already included elsewhere.</label>
      <button className="button primary" disabled={invalid || !confirmed} onClick={commit}>Import {preview.rows.length} shipment{preview.rows.length === 1 ? '' : 's'}</button>
      {invalid && <p className="source-notice" role="status">Fix every error and preview again. No rows have been imported.</p>}
    </section>}
    <div className="info-note"><ShieldCheck size={17} /><span>This is a local pilot workspace. Imported data stays in this browser; there is no account, server upload, or secure multiuser storage. Use fictional or anonymized data for demonstrations.</span></div>
  </>;
}
