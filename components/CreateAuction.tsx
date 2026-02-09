import React, { useState } from 'react';
import { auctionEngine } from '../services/mockBackend';
import { AuctionType, CreateAuctionRequest } from '../types';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';

export function CreateAuction() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateAuctionRequest>({
    name: '',
    auctionType: AuctionType.REVERSE,
    clientId: 'CLIENT-001', // Mock default
    createdBy: 'ADMIN-USER', // Mock default
    ruleset: {
      minBidDecrement: 100,
      timerExtensionThresholdSeconds: 10,
      timerExtensionSeconds: 120,
      allowRankVisibility: true,
    },
    lanes: [
        { laneName: 'Mumbai -> Delhi (FTL)', sequenceOrder: 1, basePrice: 50000, minBidDecrement: 100, timerDurationSeconds: 300, tatDays: 4 }
    ],
  });

  const handleLaneChange = (index: number, field: string, value: any) => {
    const newLanes = [...formData.lanes];
    // @ts-ignore
    newLanes[index][field] = value;
    setFormData({ ...formData, lanes: newLanes });
  };

  const addLane = () => {
    setFormData({
      ...formData,
      lanes: [
        ...formData.lanes,
        { laneName: '', sequenceOrder: formData.lanes.length + 1, basePrice: 0, minBidDecrement: 100, timerDurationSeconds: 300, tatDays: 3 },
      ],
    });
  };

  const removeLane = (index: number) => {
    const newLanes = formData.lanes.filter((_, i) => i !== index);
    setFormData({ ...formData, lanes: newLanes });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = auctionEngine.createAuction(formData);
      navigate(`/auction/${id}`);
    } catch (err) {
      alert('Error creating auction');
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Create New Auction</h1>
        <p className="text-slate-500">Configure auction rules and add lanes.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 border-b border-slate-100 pb-2">General Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Auction Name</label>
              <input
                type="text"
                required
                className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-accent outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Q4 Logistics Allocation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                className="w-full border border-slate-300 rounded px-3 py-2 bg-white"
                value={formData.auctionType}
                onChange={(e) => setFormData({ ...formData, auctionType: e.target.value as AuctionType })}
              >
                {Object.values(AuctionType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Ruleset */}
        <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 border-b border-slate-100 pb-2">Global Ruleset</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Default Decrement (INR)</label>
               <input type="number" className="w-full border border-slate-300 rounded px-3 py-2"
                 value={formData.ruleset.minBidDecrement}
                 onChange={e => setFormData({...formData, ruleset: {...formData.ruleset, minBidDecrement: Number(e.target.value)}})}
               />
            </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Extension Threshold (sec)</label>
               <input type="number" className="w-full border border-slate-300 rounded px-3 py-2"
                 value={formData.ruleset.timerExtensionThresholdSeconds}
                 onChange={e => setFormData({...formData, ruleset: {...formData.ruleset, timerExtensionThresholdSeconds: Number(e.target.value)}})}
               />
               <p className="text-xs text-slate-400 mt-1">Bids in this window extend timer.</p>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Extension Duration (sec)</label>
               <input type="number" className="w-full border border-slate-300 rounded px-3 py-2"
                 value={formData.ruleset.timerExtensionSeconds}
                 onChange={e => setFormData({...formData, ruleset: {...formData.ruleset, timerExtensionSeconds: Number(e.target.value)}})}
               />
            </div>
          </div>
        </section>

        {/* Lanes */}
        <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
             <h2 className="text-lg font-semibold">Lanes</h2>
             <button type="button" onClick={addLane} className="text-accent text-sm font-medium hover:underline flex items-center">
                <Plus size={16} className="mr-1"/> Add Lane
             </button>
          </div>
          
          <div className="space-y-4">
            {formData.lanes.map((lane, idx) => (
              <div key={idx} className="flex items-start space-x-4 p-4 bg-slate-50 rounded border border-slate-200">
                <div className="flex-1 grid grid-cols-12 gap-4">
                   <div className="col-span-4">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Lane Name</label>
                      <input type="text" className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                        value={lane.laneName} onChange={e => handleLaneChange(idx, 'laneName', e.target.value)} required placeholder="Origin -> Dest"
                      />
                   </div>
                   <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Base Price</label>
                      <input type="number" className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                        value={lane.basePrice} onChange={e => handleLaneChange(idx, 'basePrice', Number(e.target.value))} required
                      />
                   </div>
                   <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Duration (s)</label>
                      <input type="number" className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                        value={lane.timerDurationSeconds} onChange={e => handleLaneChange(idx, 'timerDurationSeconds', Number(e.target.value))} required
                      />
                   </div>
                   <div className="col-span-2">
                       <label className="block text-xs font-medium text-slate-500 mb-1">Decr.</label>
                       <input type="number" className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                         value={lane.minBidDecrement} onChange={e => handleLaneChange(idx, 'minBidDecrement', Number(e.target.value))} required
                       />
                   </div>
                   <div className="col-span-2">
                       <label className="block text-xs font-medium text-slate-500 mb-1">TAT (Days)</label>
                       <input type="number" className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                         value={lane.tatDays || ''} onChange={e => handleLaneChange(idx, 'tatDays', Number(e.target.value))}
                       />
                   </div>
                </div>
                {formData.lanes.length > 1 && (
                    <button type="button" onClick={() => removeLane(idx)} className="mt-6 text-slate-400 hover:text-danger">
                        <Trash2 size={18} />
                    </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end pt-4">
            <button type="button" onClick={() => navigate('/')} className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded mr-4">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary hover:bg-slate-800 text-white rounded font-medium shadow-lg shadow-primary/30">Create Auction</button>
        </div>
      </form>
    </div>
  );
}
