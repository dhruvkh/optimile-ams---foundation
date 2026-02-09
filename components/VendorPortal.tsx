import React, { useState, useEffect } from 'react';
import { auctionEngine } from '../services/mockBackend';
import { RFI, RFQ, RFQLane } from '../types';
import { Link } from 'react-router-dom';
import { FileText, Paperclip } from 'lucide-react';

export function VendorPortal() {
    const [rfis, setRFIs] = useState<RFI[]>([]);
    const [rfqs, setRFQs] = useState<RFQ[]>([]);
    const vendorId = "VENDOR-DEMO"; // Mock Identity

    useEffect(() => {
        const snap = auctionEngine.getSnapshot();
        setRFIs(snap.rfis.filter(r => r.status === 'OPEN'));
        setRFQs(snap.rfqs.filter(r => r.status === 'SENT'));
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-8">Vendor Portal <span className="text-sm font-normal text-slate-500">ID: {vendorId}</span></h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                    <h2 className="text-lg font-bold mb-4">Open RFIs</h2>
                    <div className="space-y-4">
                        {rfis.map(rfi => (
                            <RFIResponseCard key={rfi.id} rfi={rfi} vendorId={vendorId} />
                        ))}
                        {rfis.length === 0 && <div className="text-slate-400 italic">No open RFIs.</div>}
                    </div>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-4">Active RFQs</h2>
                    <div className="space-y-4">
                        {rfqs.map(rfq => (
                            <RFQResponseCard key={rfq.id} rfq={rfq} vendorId={vendorId} />
                        ))}
                        {rfqs.length === 0 && <div className="text-slate-400 italic">No active RFQs.</div>}
                    </div>
                </section>
            </div>
        </div>
    );
}

function RFIResponseCard({ rfi, vendorId }: { rfi: RFI, vendorId: string }) {
    const [interested, setInterested] = useState<boolean | null>(null);
    const [notes, setNotes] = useState('');

    const respond = (val: boolean) => {
        setInterested(val);
        auctionEngine.recordVendorInterest(rfi.id, vendorId, val, notes);
    };

    return (
        <div className="bg-white p-4 rounded border border-slate-200">
            <div className="mb-2">
                <h3 className="font-bold">{rfi.title}</h3>
                <p className="text-sm text-slate-500">{rfi.description}</p>
                {rfi.attachments && rfi.attachments.length > 0 && (
                     <div className="mt-2 text-xs flex flex-wrap gap-2">
                         {rfi.attachments.map((f, i) => (
                             <span key={i} className="bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 flex items-center">
                                 <Paperclip size={10} className="mr-1"/> {f}
                             </span>
                         ))}
                     </div>
                )}
            </div>

            {interested === null ? (
                <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                    <input className="w-full border p-1 text-sm rounded" placeholder="Optional notes..." value={notes} onChange={e=>setNotes(e.target.value)} />
                    <div className="flex space-x-2">
                        <button onClick={()=>respond(true)} className="flex-1 bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700">Interested</button>
                        <button onClick={()=>respond(false)} className="flex-1 bg-slate-200 text-slate-700 py-1 rounded text-sm hover:bg-slate-300">Decline</button>
                    </div>
                </div>
            ) : (
                <div className={`text-sm font-bold mt-2 ${interested ? 'text-green-600' : 'text-slate-400'}`}>
                    Response Sent: {interested ? 'Interested' : 'Declined'}
                </div>
            )}
        </div>
    );
}

function RFQResponseCard({ rfq, vendorId }: { rfq: RFQ, vendorId: string }) {
    const [lanes, setLanes] = useState<RFQLane[]>([]);
    
    useEffect(() => {
        setLanes(auctionEngine.getRFQLanes(rfq.id));
    }, [rfq.id]);

    const submitQuote = (laneId: string, price: number) => {
        auctionEngine.submitQuote(laneId, vendorId, price, true);
    };

    return (
        <div className="bg-white p-4 rounded border border-slate-200">
            <h3 className="font-bold mb-3">{rfq.name}</h3>
            <div className="space-y-2">
                {lanes.map(l => (
                    <div key={l.id} className="text-sm flex justify-between items-center bg-slate-50 p-2 rounded">
                        <div>
                            <div className="font-medium">{l.laneName}</div>
                            <div className="text-xs text-slate-500">{l.truckType} • {l.estMonthlyVolume} trips {l.tatDays ? `• TAT: ${l.tatDays} days` : ''}</div>
                        </div>
                        <input 
                            type="number" 
                            className="w-24 border p-1 rounded text-right" 
                            placeholder="Quote"
                            onBlur={(e) => submitQuote(l.id, Number(e.target.value))}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
