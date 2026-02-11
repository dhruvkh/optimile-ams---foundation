import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { auctionEngine } from './services/mockBackend';
import { CreateAuction } from './components/CreateAuction';
import { Dashboard } from './components/Dashboard';
import { AuctionDetail } from './components/AuctionDetail';
import { VendorConsole } from './components/VendorConsole';
import { AuditLogViewer } from './components/AuditLogViewer';
import { LiveLaneMonitor } from './components/LiveLaneMonitor';
import { ClientHub } from './components/ClientHub';
import { CreateRFI, RFIView } from './components/RFIManager';
import { CreateRFQ, RFQBuilder } from './components/RFQBuilder';
import { VendorPortal } from './components/VendorPortal';
import { AwardScreen } from './components/AwardScreen';
import { ContractList, ContractDetail } from './components/ContractManager';
import { ContractPreview } from './components/ContractPreview';
import { ExecutionMapping } from './components/ExecutionMapping';
import { IndentSimulator } from './components/IndentSimulator';
import { SLAConfiguration } from './components/SLAConfiguration';
import { LiveSLAMonitor } from './components/LiveSLAMonitor';
import { VendorPlacement } from './components/VendorPlacement';
import { SpotMonitor } from './components/SpotMonitor';
import { SpotVendorConsole } from './components/SpotVendorConsole';
import { SpotPlacement } from './components/SpotPlacement';
import { ToastProvider } from './components/common';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { VendorScorecardDashboard } from './components/VendorScorecardDashboard';
import { AuctionDrafts } from './components/AuctionDrafts';
import { AuctionPreview } from './components/AuctionPreview';
import { AuctionTemplates } from './components/AuctionTemplates';
import { TemplateDetails } from './components/TemplateDetails';
import { AlertTriangle, Box, Gavel, History, LayoutDashboard, Truck, Briefcase, Users, FileText, Network, PlayCircle, Timer, Siren, Zap, BarChart3, TrendingUp, FileStack } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  const getLinkClass = (path: string) => {
    const base = "flex items-center space-x-2 px-4 py-2 rounded-md transition-colors";
    return location.pathname === path 
      ? `${base} bg-slate-800 text-white` 
      : `${base} text-slate-400 hover:bg-slate-800 hover:text-white`;
  };

  return (
    <nav className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 text-slate-100">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center space-x-2">
           <Truck className="text-accent h-8 w-8" />
           <span>Optimile <span className="text-accent">AMS</span></span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Phase 3B: Spot</p>
      </div>
      
      <div className="p-4 space-y-2 flex-1 overflow-y-auto">
        {/* NEW: Dashboard Section */}
        <div className="pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider">Dashboards</div>
        <Link to="/dashboard/executive" className={getLinkClass('/dashboard/executive')}>
          <BarChart3 size={20} />
          <span>Executive Dashboard</span>
        </Link>
        <Link to="/dashboard/vendor-scorecard" className={getLinkClass('/dashboard/vendor-scorecard')}>
          <TrendingUp size={20} />
          <span>Vendor Scorecard</span>
        </Link>

        {/* Existing Links Start Here */}
        <Link to="/" className={getLinkClass('/')}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/client" className={getLinkClass('/client')}>
          <Briefcase size={20} />
          <span>Client Hub</span>
        </Link>
        <Link to="/contracts" className={getLinkClass('/contracts')}>
          <FileText size={20} />
          <span>Contracts</span>
        </Link>
        
        <div className="pt-4 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider">Execution & TMS</div>
        <Link to="/execution" className={getLinkClass('/execution')}>
          <Network size={20} />
          <span>Execution Map</span>
        </Link>
        <Link to="/simulator" className={getLinkClass('/simulator')}>
          <PlayCircle size={20} />
          <span>Indent Simulator</span>
        </Link>

        <div className="pt-4 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider">SLA & Accountability</div>
        <Link to="/sla-config" className={getLinkClass('/sla-config')}>
          <Timer size={20} />
          <span>SLA Config</span>
        </Link>
        <Link to="/sla-monitor" className={getLinkClass('/sla-monitor')}>
          <Siren size={20} />
          <span>Live Monitor</span>
        </Link>

        <div className="pt-4 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider">Spot Operations</div>
        <Link to="/spot-monitor" className={getLinkClass('/spot-monitor')}>
          <Zap size={20} />
          <span>Spot Monitor</span>
        </Link>
        <Link to="/spot-console" className={getLinkClass('/spot-console')}>
          <Gavel size={20} />
          <span>Vendor Console</span>
        </Link>

        <div className="pt-4 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider">Portals</div>
        <Link to="/vendor-portal" className={getLinkClass('/vendor-portal')}>
          <Users size={20} />
          <span>Vendor Portal</span>
        </Link>
        <Link to="/vendor-placement" className={getLinkClass('/vendor-placement')}>
          <Truck size={20} />
          <span>Placement</span>
        </Link>
        <Link to="/spot-placement" className={getLinkClass('/spot-placement')}>
          <Zap size={20} />
          <span>Spot Placement</span>
        </Link>
        
        <div className="pt-4 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider">Admin</div>
        <Link to="/create" className={getLinkClass('/create')}>
          <Box size={20} />
          <span>Create Auction</span>
        </Link>
        <Link to="/admin/auction-drafts" className={getLinkClass('/admin/auction-drafts')}>
          <FileStack size={20} />
          <span>Drafts</span>
        </Link>
        <Link to="/admin/auction-templates" className={getLinkClass('/admin/auction-templates')}>
          <Box size={20} />
          <span>Templates</span>
        </Link>
        <Link to="/audit" className={getLinkClass('/audit')}>
          <History size={20} />
          <span>Audit Log</span>
        </Link>
      </div>
    </nav>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navigation />
      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  // Global sync with engine for debugging or simple state
  const [, setTick] = useState(0);

  useEffect(() => {
    // Subscribe to engine updates to force re-renders if needed globally
    // or just to ensure the app is "alive"
    const unsub = auctionEngine.subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
          {/* NEW: Dashboard Routes */}
          <Route path="/dashboard/executive" element={<ExecutiveDashboard />} />
          <Route path="/dashboard/vendor-scorecard" element={<VendorScorecardDashboard />} />

          {/* Existing Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateAuction />} />
          <Route path="/auction/:id" element={<AuctionDetail />} />
          <Route path="/admin/lane/:laneId" element={<LiveLaneMonitor />} />
          <Route path="/vendor/:laneId" element={<VendorConsole />} />
          <Route path="/audit" element={<AuditLogViewer />} />
          
          {/* Phase 1 Routes */}
          <Route path="/client" element={<ClientHub />} />
          <Route path="/client/rfi/create" element={<CreateRFI />} />
          <Route path="/client/rfi/:id" element={<RFIView />} />
          <Route path="/client/rfq/create" element={<CreateRFQ />} />
          <Route path="/client/rfq/:id" element={<RFQBuilder />} />
          <Route path="/vendor-portal" element={<VendorPortal />} />
          <Route path="/award/:id" element={<AwardScreen />} />

          {/* Phase 2A Routes */}
          <Route path="/contracts" element={<ContractList />} />
          <Route path="/contract/:id" element={<ContractDetail />} />
          <Route path="/contract/preview/:id" element={<ContractPreview />} />

          {/* Phase 2B Routes */}
          <Route path="/execution" element={<ExecutionMapping />} />
          <Route path="/simulator" element={<IndentSimulator />} />

          {/* Phase 3A Routes */}
          <Route path="/sla-config" element={<SLAConfiguration />} />
          <Route path="/sla-monitor" element={<LiveSLAMonitor />} />
          <Route path="/vendor-placement" element={<VendorPlacement />} />

          {/* Phase 3B Routes */}
          <Route path="/spot-monitor" element={<SpotMonitor />} />
          <Route path="/spot-console" element={<SpotVendorConsole />} />
          <Route path="/spot-placement" element={<SpotPlacement />} />
          
          {/* Draft Management Routes */}
          <Route path="/admin/auction-drafts" element={<AuctionDrafts />} />
          
          {/* Template Management Routes */}
          <Route path="/admin/auction-templates" element={<AuctionTemplates />} />
          <Route path="/admin/auction-templates/:templateId" element={<TemplateDetails />} />
          <Route path="/admin/auction-templates/:templateId/edit" element={<div>Template Editor - Coming Soon</div>} />
          
          {/* Auction Preview Route */}
          <Route path="/admin/auction-preview" element={<div>Preview Page - Placeholder</div>} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard/executive" element={<ExecutiveDashboard />} />
          <Route path="/dashboard/vendor-scorecard" element={<VendorScorecardDashboard />} />
        </Routes>
      </Layout>
    </Router>
    </ToastProvider>
  );
}
