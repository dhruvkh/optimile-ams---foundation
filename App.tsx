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
import { VendorAuctionBidWorkspace } from './components/VendorAuctionBidWorkspace';
import { AwardScreen } from './components/AwardScreen';
import { ContractList, ContractDetail } from './components/ContractManager';
import { ContractPreview } from './components/ContractPreview';
import { ContractImportPage } from './components/ContractImportPage';
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
import { LiveAuctionsDashboard } from './components/LiveAuctionsDashboard';
import { LiveAuctionDetail } from './components/LiveAuctionDetail';
import { AuctionResultsPage } from './components/AuctionResultsPage';
import { AuctionAcceptanceDashboard } from './components/AuctionAcceptanceDashboard';
import { VendorAwardAcceptance } from './components/VendorAwardAcceptance';
import { DisputeCreatePage } from './components/DisputeCreatePage';
import { DisputesDashboard } from './components/DisputesDashboard';
import { DisputeDetailPage } from './components/DisputeDetailPage';
import { AlternateQueueDashboard } from './components/AlternateQueueDashboard';
import { VendorQueueStatusPage } from './components/VendorQueueStatusPage';
import { FailedAwardResolutionPage } from './components/FailedAwardResolutionPage';
import { AlternateQueueAnalyticsPage } from './components/AlternateQueueAnalyticsPage';
import { AuctionAnalyticsDetail } from './components/AuctionAnalyticsDetail';
import { SavingsAnalysisPage } from './components/SavingsAnalysisPage';
import { SavingsAnalysisSettings } from './components/SavingsAnalysisSettings';
import { VendorBehaviorAnalyticsPage } from './components/VendorBehaviorAnalyticsPage';
import { VendorInsightsDashboard } from './components/VendorInsightsDashboard';
import { VendorAnalyticsSettings } from './components/VendorAnalyticsSettings';
import { VendorRegistrationPage } from './components/VendorRegistrationPage';
import { VendorOnboardingDashboard } from './components/VendorOnboardingDashboard';
import { VendorPendingApprovalsPage } from './components/VendorPendingApprovalsPage';
import { VendorApplicationReviewPage } from './components/VendorApplicationReviewPage';
import { VendorBulkImportPage } from './components/VendorBulkImportPage';
import { VendorManagementPage } from './components/VendorManagementPage';
import { VendorImportHistoryPage } from './components/VendorImportHistoryPage';
import { VendorStatusManagementPage } from './components/VendorStatusManagementPage';
import { DataMigrationPage } from './components/DataMigrationPage';
import { RolesPermissionsPage } from './components/RolesPermissionsPage';
import { UsersManagementPage } from './components/UsersManagementPage';
import { PermissionAuditLogPage } from './components/PermissionAuditLogPage';
import { ActiveSessionsPage } from './components/ActiveSessionsPage';
import { PermissionRequestsPage } from './components/PermissionRequestsPage';
import { ForbiddenPage } from './components/ForbiddenPage';
import { SystemSettingsPage } from './components/SystemSettingsPage';
import { SystemSettingsAuditPage } from './components/SystemSettingsAuditPage';
import { AuditTrailDashboard } from './components/AuditTrailDashboard';
import { AuditAlertsPage } from './components/AuditAlertsPage';
import { AuditRetentionSettingsPage } from './components/AuditRetentionSettingsPage';
import { BulkLaneUploadPage } from './components/BulkLaneUploadPage';
import { rbacService } from './services/rbac';
import { Activity, AlertTriangle, BarChart3, Box, Briefcase, FileStack, FileText, Gavel, GitBranch, History, LayoutDashboard, Network, PlayCircle, ShieldCheck, Siren, Timer, TrendingUp, Truck, Upload, Users, Zap } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  const currentUserId = 'USR-ADM-1';
  const currentUserRoleName = rbacService.getUser(currentUserId)?.roleName || '';
  const isSuperAdmin = currentUserRoleName === 'SUPER ADMIN';
  const userPermissions = React.useMemo(() => {
    const granted = new Set<string>();
    rbacService.getEffectivePermissions(currentUserId).forEach((p) => {
      if (p.granted) granted.add(p.key);
    });
    return granted;
  }, [currentUserId]);
  const can = (permission: string) => userPermissions.has(permission);
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
        {can('auction.live_monitor') ? (
          <Link to="/admin/live-auctions" className={getLinkClass('/admin/live-auctions')}>
            <Activity size={20} />
            <span>Live Auctions</span>
          </Link>
        ) : null}
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
        <Link to="/vendor/queue-status" className={getLinkClass('/vendor/queue-status')}>
          <GitBranch size={20} />
          <span>Queue Status</span>
        </Link>
        <Link to="/spot-placement" className={getLinkClass('/spot-placement')}>
          <Zap size={20} />
          <span>Spot Placement</span>
        </Link>
        
        <div className="pt-4 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider">Admin</div>
        {can('auction.create') ? (
          <>
            <Link to="/create" className={getLinkClass('/create')}>
              <Box size={20} />
              <span>Create Auction</span>
            </Link>
            <Link to="/admin/auctions/bulk-upload" className={getLinkClass('/admin/auctions/bulk-upload')}>
              <Upload size={20} />
              <span>Bulk Lane Upload</span>
            </Link>
          </>
        ) : null}
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
        <Link to="/admin/audit-log" className={getLinkClass('/admin/audit-log')}>
          <ShieldCheck size={20} />
          <span>System Audit Trail</span>
        </Link>
        <Link to="/admin/disputes" className={getLinkClass('/admin/disputes')}>
          <AlertTriangle size={20} />
          <span>Disputes</span>
        </Link>
        <Link to="/admin/analytics/alternate-queue" className={getLinkClass('/admin/analytics/alternate-queue')}>
          <GitBranch size={20} />
          <span>Alt Queue Analytics</span>
        </Link>
        <Link to="/admin/analytics/savings-analysis" className={getLinkClass('/admin/analytics/savings-analysis')}>
          <BarChart3 size={20} />
          <span>Savings Analysis</span>
        </Link>
        <Link to="/admin/analytics/vendor-behavior" className={getLinkClass('/admin/analytics/vendor-behavior')}>
          <TrendingUp size={20} />
          <span>Vendor Behavior</span>
        </Link>
        <Link to="/admin/analytics/vendor-insights" className={getLinkClass('/admin/analytics/vendor-insights')}>
          <Activity size={20} />
          <span>Vendor Insights</span>
        </Link>
        <Link to="/admin/vendors/onboarding" className={getLinkClass('/admin/vendors/onboarding')}>
          <Users size={20} />
          <span>Vendor Onboarding</span>
        </Link>
        <Link to="/admin/vendors" className={getLinkClass('/admin/vendors')}>
          <Users size={20} />
          <span>Vendors</span>
        </Link>

        <div className="pt-4 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider">RBAC Settings</div>
        {can('system.manage_roles') ? (
          <Link to="/admin/settings/roles-permissions" className={getLinkClass('/admin/settings/roles-permissions')}>
            <Users size={20} />
            <span>Roles & Permissions</span>
          </Link>
        ) : null}
        {can('system.manage_users') ? (
          <Link to="/admin/settings/users" className={getLinkClass('/admin/settings/users')}>
            <Users size={20} />
            <span>User Access</span>
          </Link>
        ) : null}
        {can('system.audit_view') ? (
          <>
            <Link to="/admin/settings/system" className={getLinkClass('/admin/settings/system')}>
              <Siren size={20} />
              <span>System Config</span>
            </Link>
            <Link to="/admin/settings/audit-log" className={getLinkClass('/admin/settings/audit-log')}>
              <History size={20} />
              <span>Permission Audit</span>
            </Link>
            <Link to="/admin/settings/audit" className={getLinkClass('/admin/settings/audit')}>
              <History size={20} />
              <span>Config Audit</span>
            </Link>
            <Link to="/admin/settings/audit-retention" className={getLinkClass('/admin/settings/audit-retention')}>
              <Timer size={20} />
              <span>Audit Retention</span>
            </Link>
            <Link to="/admin/settings/active-sessions" className={getLinkClass('/admin/settings/active-sessions')}>
              <Activity size={20} />
              <span>Active Sessions</span>
            </Link>
            <Link to="/admin/settings/permission-requests" className={getLinkClass('/admin/settings/permission-requests')}>
              <AlertTriangle size={20} />
              <span>Access Requests</span>
            </Link>
            <Link to="/admin/audit-alerts" className={getLinkClass('/admin/audit-alerts')}>
              <Siren size={20} />
              <span>Audit Alerts</span>
            </Link>
            {isSuperAdmin ? (
              <Link to="/admin/data-migration" className={getLinkClass('/admin/data-migration')}>
                <Upload size={20} />
                <span>Data Migration</span>
              </Link>
            ) : null}
          </>
        ) : null}
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
          <Route path="/admin/auctions/bulk-upload" element={<BulkLaneUploadPage />} />
          <Route path="/auction/:id" element={<AuctionDetail />} />
          <Route path="/admin/lane/:laneId" element={<LiveLaneMonitor />} />
          <Route path="/vendor/:laneId" element={<VendorConsole />} />
          <Route path="/audit" element={<AuditLogViewer />} />
          <Route path="/admin/audit-log" element={<AuditTrailDashboard />} />
          <Route path="/admin/audit-alerts" element={<AuditAlertsPage />} />
          
          {/* Phase 1 Routes */}
          <Route path="/client" element={<ClientHub />} />
          <Route path="/client/rfi/create" element={<CreateRFI />} />
          <Route path="/client/rfi/:id" element={<RFIView />} />
          <Route path="/client/rfq/create" element={<CreateRFQ />} />
          <Route path="/client/rfq/:id" element={<RFQBuilder />} />
          <Route path="/vendor-portal" element={<VendorPortal />} />
          <Route path="/vendor/dashboard" element={<VendorPortal />} />
          <Route path="/vendor/auction/:auctionId/bid" element={<VendorAuctionBidWorkspace />} />
          <Route path="/vendor/award-acceptance/:awardId" element={<VendorAwardAcceptance />} />
          <Route path="/vendor/queue-status" element={<VendorQueueStatusPage />} />
          <Route path="/vendor/register" element={<VendorRegistrationPage />} />
          <Route path="/disputes/create" element={<DisputeCreatePage />} />
          <Route path="/award/:id" element={<AwardScreen />} />

          {/* Phase 2A Routes */}
          <Route path="/contracts" element={<ContractList />} />
          <Route path="/admin/contracts/import" element={<ContractImportPage />} />
          <Route path="/contract/:id" element={<ContractDetail />} />
          <Route path="/contract/preview/:id" element={<ContractPreview />} />
          <Route path="/admin/contracts/:contractId/review" element={<ContractPreview />} />

          {/* Phase 2B Routes */}
          <Route path="/execution" element={<ExecutionMapping />} />
          <Route path="/simulator" element={<IndentSimulator />} />

          {/* Phase 3A Routes */}
          <Route path="/sla-config" element={<SLAConfiguration />} />
          <Route path="/sla-monitor" element={<LiveSLAMonitor />} />
          <Route path="/vendor-placement" element={<VendorPlacement />} />

          {/* Phase 3B Routes */}
          <Route path="/spot-monitor" element={<SpotMonitor />} />
          <Route path="/admin/live-auctions" element={<LiveAuctionsDashboard />} />
          <Route path="/admin/live-auctions/:auctionId" element={<LiveAuctionDetail />} />
          <Route path="/admin/auction-results/:auctionId" element={<AuctionResultsPage />} />
          <Route path="/admin/auction-results/:auctionId/acceptances" element={<AuctionAcceptanceDashboard />} />
          <Route path="/admin/auction-results/:auctionId/alternate-queue" element={<AlternateQueueDashboard />} />
          <Route path="/admin/auction-results/:auctionId/failed-awards/:laneId" element={<FailedAwardResolutionPage />} />
          <Route path="/admin/analytics/alternate-queue" element={<AlternateQueueAnalyticsPage />} />
          <Route path="/admin/analytics/auctions/:auctionId" element={<AuctionAnalyticsDetail />} />
          <Route path="/admin/analytics/savings-analysis" element={<SavingsAnalysisPage />} />
          <Route path="/admin/analytics/vendor-behavior" element={<VendorBehaviorAnalyticsPage />} />
          <Route path="/admin/analytics/vendor-insights" element={<VendorInsightsDashboard />} />
          <Route path="/admin/vendors/onboarding" element={<VendorOnboardingDashboard />} />
          <Route path="/admin/vendors" element={<VendorManagementPage />} />
          <Route path="/admin/vendors/pending-approvals" element={<VendorPendingApprovalsPage />} />
          <Route path="/admin/vendors/review/:applicationId" element={<VendorApplicationReviewPage />} />
          <Route path="/admin/vendors/bulk-import" element={<VendorBulkImportPage />} />
          <Route path="/admin/vendors/import-history" element={<VendorImportHistoryPage />} />
          <Route path="/admin/vendors/status-management" element={<VendorStatusManagementPage />} />
          <Route path="/admin/settings/roles-permissions" element={<RolesPermissionsPage />} />
          <Route path="/admin/settings/users" element={<UsersManagementPage />} />
          <Route path="/admin/settings/system" element={<SystemSettingsPage />} />
          <Route path="/admin/settings/audit-log" element={<PermissionAuditLogPage />} />
          <Route path="/admin/settings/audit" element={<SystemSettingsAuditPage />} />
          <Route path="/admin/settings/audit-retention" element={<AuditRetentionSettingsPage />} />
          <Route path="/admin/settings/active-sessions" element={<ActiveSessionsPage />} />
          <Route path="/admin/settings/permission-requests" element={<PermissionRequestsPage />} />
          <Route path="/403-forbidden" element={<ForbiddenPage />} />
          <Route path="/admin/settings/savings-analysis" element={<SavingsAnalysisSettings />} />
          <Route path="/admin/settings/vendor-analytics" element={<VendorAnalyticsSettings />} />
          <Route path="/admin/data-migration" element={<DataMigrationPage />} />
          <Route path="/admin/disputes" element={<DisputesDashboard />} />
          <Route path="/admin/disputes/:disputeId" element={<DisputeDetailPage />} />
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
