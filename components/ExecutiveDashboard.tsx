import React, { useEffect, useState } from 'react';
import { auctionEngine } from '../services/mockBackend';
import { Auction, AuctionStatus } from '../types';
import { TrendingUp, Users, Zap, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardMetrics {
  totalAuctions: number;
  activeAuctions: number;
  completedAuctions: number;
  totalSavings: number;
  savingsPercentage: number;
  avgParticipationRate: number;
  vendorCount: number;
  topVendors: Array<{ vendorId: string; name: string; wins: number; score: number }>;
  auctionTrendData: Array<{ date: string; count: number; savings: number }>;
}

// Mock data generator
function generateMockMetrics(): DashboardMetrics {
  const now = Date.now();
  const last30Days = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    last30Days.push({
      date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      count: Math.floor(Math.random() * 5) + 1,
      savings: Math.floor(Math.random() * 50000) + 10000,
    });
  }

  return {
    totalAuctions: 156,
    activeAuctions: 12,
    completedAuctions: 144,
    totalSavings: 2456000,
    savingsPercentage: 12.5,
    avgParticipationRate: 73,
    vendorCount: 47,
    topVendors: [
      { vendorId: 'V-001', name: 'Swift Logistics', wins: 24, score: 95 },
      { vendorId: 'V-002', name: 'Elite Transport', wins: 18, score: 88 },
      { vendorId: 'V-003', name: 'Highway Express', wins: 16, score: 85 },
    ],
    auctionTrendData: last30Days,
  };
}

export function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    const metrics = generateMockMetrics();
    setMetrics(metrics);

    const snap = auctionEngine.getSnapshot();
    setAuctions(snap.auctions);

    const unsub = auctionEngine.subscribe(() => {
      const snap = auctionEngine.getSnapshot();
      setAuctions(snap.auctions);
    });

    return unsub;
  }, []);

  if (!metrics) return <LoadingState />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Executive Dashboard</h1>
        <p className="text-slate-500 mt-1">Real-time auction management and performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <KPICard
          icon={Zap}
          label="Active Auctions"
          value={metrics.activeAuctions}
          color="blue"
          trend={{ value: 2, positive: true }}
        />
        <KPICard
          icon={DollarSign}
          label="Total Savings"
          value={`₹${(metrics.totalSavings / 100000).toFixed(1)}L`}
          color="green"
          trend={{ value: metrics.savingsPercentage, positive: true }}
        />
        <KPICard
          icon={Users}
          label="Avg Participation"
          value={`${metrics.avgParticipationRate}%`}
          color="purple"
          trend={{ value: 3, positive: true }}
        />
        <KPICard
          icon={TrendingUp}
          label="Vendors"
          value={metrics.vendorCount}
          color="orange"
          trend={{ value: 5, positive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Auction Trends Chart */}
        <div className="col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Auction Trends (30 Days)</h2>
          </div>
          <div className="p-6">
            <SimpleLineChart data={metrics.auctionTrendData} />
          </div>
        </div>

        {/* Top Vendors */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Top Vendors</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {metrics.topVendors.map((vendor, idx) => (
              <div key={vendor.vendorId} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{vendor.name}</p>
                    <p className="text-xs text-slate-500">{vendor.wins} wins</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">{vendor.score}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all"
                    style={{ width: `${vendor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auction Status Distribution */}
      <div className="grid grid-cols-3 gap-6">
        <AuctionStatusCard
          status={AuctionStatus.RUNNING}
          count={auctions.filter((a) => a.status === AuctionStatus.RUNNING).length}
          color="green"
        />
        <AuctionStatusCard
          status={AuctionStatus.PUBLISHED}
          count={auctions.filter((a) => a.status === AuctionStatus.PUBLISHED).length}
          color="blue"
        />
        <AuctionStatusCard
          status={AuctionStatus.COMPLETED}
          count={auctions.filter((a) => a.status === AuctionStatus.COMPLETED).length}
          color="slate"
        />
      </div>

      {/* Recent Auctions */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Recent Auctions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Name</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Type</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-6 py-3 text-right font-medium text-slate-600">Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auctions.slice(0, 5).map((auction) => (
                <tr key={auction.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{auction.name}</td>
                  <td className="px-6 py-4 text-slate-600">{auction.auctionType}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={auction.status} />
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">
                    ₹{Math.floor(Math.random() * 100000).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  trend?: { value: number; positive: boolean };
}

function KPICard({ icon: Icon, label, value, color, trend }: KPICardProps) {
  const bgColor = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
  }[color];

  const iconColor = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  }[color];

  return (
    <div className={`${bgColor} rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-600 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        {Icon && <Icon className={`${iconColor} opacity-50`} size={24} />}
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span className="font-medium">{trend.value}% vs last period</span>
        </div>
      )}
    </div>
  );
}

function AuctionStatusCard({ status, count, color }: any) {
  const colors = {
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    slate: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <div className={`border rounded-lg p-6 ${colors[color]}`}>
      <p className="font-medium mb-2">{status}</p>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: AuctionStatus }) {
  const colors = {
    [AuctionStatus.DRAFT]: 'bg-slate-100 text-slate-700',
    [AuctionStatus.PUBLISHED]: 'bg-blue-100 text-blue-700',
    [AuctionStatus.RUNNING]: 'bg-green-100 text-green-700',
    [AuctionStatus.PAUSED]: 'bg-yellow-100 text-yellow-700',
    [AuctionStatus.COMPLETED]: 'bg-slate-100 text-slate-800',
    [AuctionStatus.CANCELLED]: 'bg-red-50 text-red-600',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors[status]}`}>
      {status}
    </span>
  );
}

function SimpleLineChart({ data }: { data: any[] }) {
  // Simple ASCII-style chart
  const maxValue = Math.max(...data.map((d) => d.savings));
  const normalized = data.map((d) => ({
    ...d,
    height: (d.savings / maxValue) * 100,
  }));

  return (
    <div className="flex items-end space-x-1 h-32">
      {normalized.map((item, idx) => (
        <div
          key={idx}
          className="flex-1 bg-blue-400 rounded-t hover:bg-blue-500 transition-colors relative group"
          style={{ height: `${item.height}%` }}
          title={`${item.date}: ₹${item.savings}`}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            ₹{(item.savings / 1000).toFixed(0)}K
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 bg-slate-100 rounded animate-pulse" />
      ))}
    </div>
  );
}