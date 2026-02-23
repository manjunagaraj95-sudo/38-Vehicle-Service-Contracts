
import React, { useState, useEffect } from 'react';

// --- ROLES and RBAC Configuration ---
const ROLES = {
  F_I_PRODUCT_MANAGER: ['dashboard', 'vsc_contracts', 'vsc_contract_details', 'create_vsc', 'edit_vsc', 'claims', 'claim_details', 'reports', 'admin_settings'],
  CUSTOMER_SERVICE_REPRESENTATIVE: ['dashboard', 'vsc_contracts', 'vsc_contract_details', 'claims', 'claim_details', 'renew_vsc', 'cancel_vsc', 'file_claim'],
  DEALERSHIP_PORTAL_USER: ['dashboard', 'vsc_contracts', 'vsc_contract_details', 'create_vsc', 'claims', 'claim_details', 'reports', 'file_claim'],
  VEHICLE_OWNER: ['dashboard', 'my_contracts', 'vsc_contract_details', 'file_claim', 'claim_details', 'notifications'], // Dashboard here implies 'My Dashboard' with relevant info
  SYSTEM_ARCHITECT: ['dashboard', 'vsc_contracts', 'vsc_contract_details', 'claims', 'claim_details', 'reports', 'admin_settings', 'system_logs', 'create_vsc', 'edit_vsc', 'file_claim']
};

const CURRENT_USER_ROLE = 'F_I_PRODUCT_MANAGER'; // Change for testing other roles

const canAccess = (screenKey) => ROLES[CURRENT_USER_ROLE]?.includes(screenKey.toLowerCase());

// --- Status Mappings ---
const STATUS_MAP = {
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  IN_REVIEW: 'In Review',
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  DRAFT: 'Draft',
  PAID: 'Paid',
  UNDER_REVIEW: 'Under Review',
  SETTLED: 'Settled',
};

const STATUS_COLORS = {
  PENDING_APPROVAL: 'var(--color-status-orange)',
  APPROVED: 'var(--color-status-green)',
  REJECTED: 'var(--color-status-red)',
  IN_REVIEW: 'var(--color-status-blue)',
  ACTIVE: 'var(--color-status-green)',
  EXPIRED: 'var(--color-status-red-light)',
  CANCELLED: 'var(--color-status-grey)',
  DRAFT: 'var(--color-status-purple)',
  PAID: 'var(--color-status-green-dark)',
  UNDER_REVIEW: 'var(--color-status-yellow)',
  SETTLED: 'var(--color-status-green)',
};

// --- Dummy Data ---
const dummyVSCContracts = [
  { id: 'VSC-001', customerName: 'Alice Johnson', vehicle: 'Toyota Camry', plan: 'Gold Plus', status: 'ACTIVE', effectiveDate: '2023-01-15', expirationDate: '2028-01-15', premium: 1200, workflowStage: 'Active Contract', slaStatus: 'Green' },
  { id: 'VSC-002', customerName: 'Bob Williams', vehicle: 'Ford F-150', plan: 'Silver', status: 'PENDING_APPROVAL', effectiveDate: '2023-03-01', expirationDate: '2028-03-01', premium: 950, workflowStage: 'Underwriting Review', slaStatus: 'Orange' },
  { id: 'VSC-003', customerName: 'Charlie Brown', vehicle: 'Honda Civic', plan: 'Bronze', status: 'EXPIRED', effectiveDate: '2018-05-20', expirationDate: '2023-05-20', premium: 700, workflowStage: 'Expired', slaStatus: 'Red' },
  { id: 'VSC-004', customerName: 'Diana Prince', vehicle: 'Tesla Model 3', plan: 'Platinum', status: 'APPROVED', effectiveDate: '2024-02-10', expirationDate: '2029-02-10', premium: 1800, workflowStage: 'Policy Issuance', slaStatus: 'Green' },
  { id: 'VSC-005', customerName: 'Eve Adams', vehicle: 'Chevrolet Silverado', plan: 'Gold', status: 'CANCELLED', effectiveDate: '2022-11-01', expirationDate: '2027-11-01', premium: 1100, workflowStage: 'Cancelled', slaStatus: 'Red' },
  { id: 'VSC-006', customerName: 'Frank White', vehicle: 'BMW X5', plan: 'Platinum', status: 'ACTIVE', effectiveDate: '2023-07-01', expirationDate: '2028-07-01', premium: 2000, workflowStage: 'Active Contract', slaStatus: 'Green' },
  { id: 'VSC-007', customerName: 'Grace Lee', vehicle: 'Nissan Rogue', plan: 'Silver Plus', status: 'DRAFT', effectiveDate: '2024-04-01', expirationDate: '2029-04-01', premium: 1050, workflowStage: 'Drafting', slaStatus: 'Green' },
];

const dummyClaims = [
  { id: 'CLM-001', vscId: 'VSC-001', customerName: 'Alice Johnson', vehicle: 'Toyota Camry', claimType: 'Engine Repair', status: 'IN_REVIEW', submittedDate: '2024-03-10', amountRequested: 1500, workflowStage: 'Initial Review', slaStatus: 'Orange' },
  { id: 'CLM-002', vscId: 'VSC-002', customerName: 'Bob Williams', vehicle: 'Ford F-150', claimType: 'Transmission', status: 'APPROVED', submittedDate: '2024-02-28', amountRequested: 2800, workflowStage: 'Payment Processing', slaStatus: 'Green' },
  { id: 'CLM-003', vscId: 'VSC-003', customerName: 'Charlie Brown', vehicle: 'Honda Civic', claimType: 'Electrical Issue', status: 'REJECTED', submittedDate: '2024-01-10', amountRequested: 500, workflowStage: 'Claim Closed', slaStatus: 'Red' },
  { id: 'CLM-004', vscId: 'VSC-004', customerName: 'Diana Prince', vehicle: 'Tesla Model 3', claimType: 'Brake System', status: 'PENDING_APPROVAL', submittedDate: '2024-03-20', amountRequested: 900, workflowStage: 'Fraud Detection', slaStatus: 'Red' },
  { id: 'CLM-005', vscId: 'VSC-001', customerName: 'Alice Johnson', vehicle: 'Toyota Camry', claimType: 'AC System', status: 'SETTLED', submittedDate: '2024-03-01', amountRequested: 700, workflowStage: 'Claim Closed', slaStatus: 'Green' },
  { id: 'CLM-006', vscId: 'VSC-006', customerName: 'Frank White', vehicle: 'BMW X5', claimType: 'Suspension', status: 'UNDER_REVIEW', submittedDate: '2024-04-05', amountRequested: 2200, workflowStage: 'Expert Review', slaStatus: 'Green' },
];

const dummyActivities = [
  { id: 'ACT-001', type: 'VSC Created', description: 'VSC-007 for Grace Lee', date: '2024-04-01 10:30 AM', status: 'APPROVED', link: { screen: 'VSC_CONTRACT_DETAILS', params: { id: 'VSC-007' } } },
  { id: 'ACT-002', type: 'Claim Filed', description: 'CLM-006 for Frank White', date: '2024-04-05 11:15 AM', status: 'IN_REVIEW', link: { screen: 'CLAIM_DETAILS', params: { id: 'CLM-006' } } },
  { id: 'ACT-003', type: 'VSC Approved', description: 'VSC-004 for Diana Prince', date: '2024-02-10 09:00 AM', status: 'APPROVED', link: { screen: 'VSC_CONTRACT_DETAILS', params: { id: 'VSC-004' } } },
  { id: 'ACT-004', type: 'Claim Settled', description: 'CLM-005 for Alice Johnson', date: '2024-03-01 02:45 PM', status: 'PAID', link: { screen: 'CLAIM_DETAILS', params: { id: 'CLM-005' } } },
  { id: 'ACT-005', type: 'VSC Cancelled', description: 'VSC-005 for Eve Adams', date: '2024-03-15 01:00 PM', status: 'CANCELLED', link: { screen: 'VSC_CONTRACT_DETAILS', params: { id: 'VSC-005' } } },
];

// --- Workflow Stages for VSC and Claims ---
const VSC_WORKFLOW_STAGES = [
  { name: 'Drafting', key: 'Drafting' },
  { name: 'Underwriting Review', key: 'Underwriting Review' },
  { name: 'Policy Issuance', key: 'Policy Issuance' },
  { name: 'Active Contract', key: 'Active Contract' },
  { name: 'Renewal Pending', key: 'Renewal Pending' },
  { name: 'Expired', key: 'Expired' },
  { name: 'Cancelled', key: 'Cancelled' },
];

const CLAIM_WORKFLOW_STAGES = [
  { name: 'Initial Review', key: 'Initial Review' },
  { name: 'Fraud Detection', key: 'Fraud Detection' },
  { name: 'Expert Review', key: 'Expert Review' },
  { name: 'Adjudication', key: 'Adjudication' },
  { name: 'Payment Processing', key: 'Payment Processing' },
  { name: 'Claim Closed', key: 'Claim Closed' },
];


function App() {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  const [breadcrumbs, setBreadcrumbs] = useState([{ label: 'Dashboard', screen: 'DASHBOARD' }]);

  const navigate = (screen, params = {}) => {
    if (!canAccess(screen)) {
      alert(`Access Denied: You do not have permission to view ${screen.replace(/_/g, ' ')}. Please contact your administrator.`);
      return;
    }

    const newBreadcrumb = { label: screen.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), screen, params };
    const existingIndex = breadcrumbs.findIndex(b => b.screen === screen && JSON.stringify(b.params) === JSON.stringify(params));

    if (existingIndex !== -1) {
      setBreadcrumbs(breadcrumbs.slice(0, existingIndex + 1));
    } else {
      setBreadcrumbs((prevBreadcrumbs) => [...prevBreadcrumbs, newBreadcrumb]);
    }
    setView({ screen, params });
  };

  useEffect(() => {
    if (breadcrumbs.length === 1 && breadcrumbs[0].screen === 'DASHBOARD' && view.screen !== 'DASHBOARD') {
      setBreadcrumbs([]);
      navigate(view.screen, view.params);
    } else if (breadcrumbs.length === 0 && view.screen === 'DASHBOARD') {
        setBreadcrumbs([{ label: 'Dashboard', screen: 'DASHBOARD' }]);
    }
  }, [view.screen]);

  const handleBreadcrumbClick = (screen, params) => {
    const targetIndex = breadcrumbs.findIndex(b => b.screen === screen && JSON.stringify(b.params) === JSON.stringify(params));
    if (targetIndex !== -1) {
      setBreadcrumbs((prevBreadcrumbs) => prevBreadcrumbs.slice(0, targetIndex + 1));
      setView({ screen, params });
    }
  };


  // --- Reusable Components ---

  const Card = ({ title, description, status, onClick, children, type = 'default' }) => (
    <div
      className={`card card--${type}`}
      style={{
        borderLeftColor: STATUS_COLORS[status] || 'var(--color-primary-light)',
        cursor: 'pointer'
      }}
      onClick={() => onClick()}
    >
      <div className="card__header">
        <h3 className="card__title">{title}</h3>
        <span className="card__status" style={{ backgroundColor: STATUS_COLORS[status] || 'var(--color-status-grey)' }}>
          {STATUS_MAP[status] || status}
        </span>
      </div>
      <p className="card__description">{description}</p>
      {children}
    </div>
  );

  const Breadcrumbs = () => (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={`${crumb.screen}-${index}`}>
          <button
            className="breadcrumb__item"
            onClick={() => handleBreadcrumbClick(crumb.screen, crumb.params)}
            disabled={index === breadcrumbs.length - 1}
          >
            {crumb.label}
          </button>
          {index < (breadcrumbs.length - 1) && <span className="breadcrumb__separator">/</span>}
        </React.Fragment>
      ))}
    </nav>
  );

  const WorkflowTracker = ({ stages, currentStage, slaStatus }) => {
    const currentStageIndex = stages.findIndex(s => s.key === currentStage);
    return (
      <div className="workflow-tracker">
        {stages.map((stage, index) => (
          <div
            key={stage.key}
            className={`workflow-tracker__stage ${index <= currentStageIndex ? 'workflow-tracker__stage--completed' : ''} ${stage.key === currentStage ? 'workflow-tracker__stage--current' : ''}`}
          >
            <span className="workflow-tracker__indicator" style={(stage.key === currentStage) ? { borderColor: STATUS_COLORS[slaStatus] || 'var(--color-primary)' } : {}} />
            <span className="workflow-tracker__name">{stage.name}</span>
          </div>
        ))}
      </div>
    );
  };

  const ChartPlaceholder = ({ type, title }) => (
    <div className="chart-placeholder">
      <h4 className="chart-placeholder__title">{title}</h4>
      <p className="chart-placeholder__type">{type} Chart</p>
      <div className="chart-placeholder__bar" style={{ width: `${Math.random() * 60 + 30}%`, animationDelay: `${Math.random() * 0.5}s` }}></div>
      <div className="chart-placeholder__bar" style={{ width: `${Math.random() * 60 + 30}%`, animationDelay: `${Math.random() * 0.5}s` }}></div>
      <div className="chart-placeholder__bar" style={{ width: `${Math.random() * 60 + 30}%`, animationDelay: `${Math.random() * 0.5}s` }}></div>
    </div>
  );

  // --- Screens ---

  const DashboardScreen = () => {
    const contractsSummary = dummyVSCContracts.reduce((acc, contract) => {
      acc[contract.status] = (acc[contract.status] || 0) + 1;
      return acc;
    }, {});

    const claimsSummary = dummyClaims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {});

    const kpis = [
      { id: 'kpi-1', label: 'Active Contracts', value: contractsSummary.ACTIVE || 0, color: 'var(--color-status-green)' },
      { id: 'kpi-2', label: 'Pending Claims', value: (claimsSummary.IN_REVIEW || 0) + (claimsSummary.PENDING_APPROVAL || 0) + (claimsSummary.UNDER_REVIEW || 0), color: 'var(--color-status-orange)' },
      { id: 'kpi-3', label: 'Total Premiums', value: `$${dummyVSCContracts.reduce((sum, c) => sum + (c.premium || 0), 0).toLocaleString()}`, color: 'var(--color-primary)' },
      { id: 'kpi-4', label: 'Settled Claims', value: `$${dummyClaims.filter(c => c.status === 'SETTLED' || c.status === 'APPROVED').reduce((sum, c) => sum + (c.amountRequested || 0), 0).toLocaleString()}`, color: 'var(--color-status-green-dark)' },
    ];

    const handleLogout = () => {
      alert('Logging out...');
      // Implement actual logout logic (e.g., clear tokens, redirect to login)
      navigate('DASHBOARD'); // For demo, redirect to dashboard
    };

    return (
      <div className="dashboard-screen screen-content">
        <h1 className="screen-title">Dashboard</h1>

        <div className="dashboard-kpis">
          {kpis.map(kpi => (
            <div key={kpi.id} className="kpi-card" style={{ borderLeftColor: kpi.color }}>
              <span className="kpi-card__label">{kpi.label}</span>
              <span className="kpi-card__value">{kpi.value}</span>
            </div>
          ))}
        </div>

        <section className="dashboard-section">
          <h2>Performance Overview</h2>
          <div className="chart-grid">
            <ChartPlaceholder type="Bar" title="Contracts by Status" />
            <ChartPlaceholder type="Line" title="Monthly Claims Trends" />
            <ChartPlaceholder type="Donut" title="Claim Adjudication Status" />
            <ChartPlaceholder type="Gauge" title="SLA Compliance Rate" />
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Recent Activities</h2>
          <div className="card-list">
            {(dummyActivities.length > 0) ? (
              dummyActivities.map(activity => (
                <Card
                  key={activity.id}
                  title={activity.type || 'Activity'}
                  description={`${activity.description} on ${activity.date}`}
                  status={activity.status}
                  onClick={() => navigate(activity.link?.screen || 'DASHBOARD', activity.link?.params || {})}
                  type="activity"
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No recent activities to display.</p>
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Quick Insights</h2>
          <div className="card-list">
            {(dummyVSCContracts.filter(c => c.status === 'PENDING_APPROVAL').slice(0, 3).length > 0) ? (
              dummyVSCContracts.filter(c => c.status === 'PENDING_APPROVAL').slice(0, 3).map(contract => (
                <Card
                  key={contract.id}
                  title={`VSC: ${contract.id}`}
                  description={`${contract.customerName} - ${contract.vehicle}`}
                  status={contract.status}
                  onClick={() => navigate('VSC_CONTRACT_DETAILS', { id: contract.id })}
                  type="mini"
                >
                  <div className="card__meta">
                    <span>Plan: {contract.plan}</span>
                    <span>Premium: ${contract.premium?.toLocaleString()}</span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="empty-state">
                <p>No pending VSCs at the moment.</p>
              </div>
            )}
            {(dummyClaims.filter(c => c.status === 'IN_REVIEW' || c.status === 'PENDING_APPROVAL').slice(0, 3).length > 0) ? (
              dummyClaims.filter(c => c.status === 'IN_REVIEW' || c.status === 'PENDING_APPROVAL').slice(0, 3).map(claim => (
                <Card
                  key={claim.id}
                  title={`Claim: ${claim.id}`}
                  description={`${claim.customerName} - ${claim.claimType}`}
                  status={claim.status}
                  onClick={() => navigate('CLAIM_DETAILS', { id: claim.id })}
                  type="mini"
                >
                  <div className="card__meta">
                    <span>VSC: {claim.vscId}</span>
                    <span>Amount: ${claim.amountRequested?.toLocaleString()}</span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="empty-state">
                <p>No claims currently in review.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  };

  const VSCContractsScreen = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortBy, setSortBy] = useState('effectiveDate'); // Default sort

    const filteredAndSortedContracts = dummyVSCContracts
      .filter(contract =>
        (filterStatus === 'ALL' || contract.status === filterStatus) &&
        (contract.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         contract.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         contract.id?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortBy === 'effectiveDate' || sortBy === 'expirationDate') {
          return new Date(b[sortBy]) - new Date(a[sortBy]); // Newest first
        }
        if (sortBy === 'premium') {
          return (b.premium || 0) - (a.premium || 0);
        }
        return 0; // No specific sort
      });


    return (
      <div className="vsc-contracts-screen screen-content">
        <Breadcrumbs />
        <h1 className="screen-title">Vehicle Service Contracts</h1>

        <div className="grid-controls">
          <input
            type="text"
            placeholder="Search VSCs..."
            className="input-field search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="select-field filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            {Object.keys(STATUS_MAP).map(key => (
              <option key={key} value={key}>{STATUS_MAP[key]}</option>
            ))}
          </select>
          <select
            className="select-field sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="effectiveDate">Sort by Effective Date (Newest)</option>
            <option value="expirationDate">Sort by Expiration Date (Newest)</option>
            <option value="premium">Sort by Premium (Highest)</option>
          </select>
          {canAccess('create_vsc') && (
            <button className="button button--primary" onClick={() => navigate('CREATE_VSC')}>
              + Create New VSC
            </button>
          )}
          {canAccess('bulk_actions_vsc') && <button className="button button--secondary">Bulk Actions</button>}
          {canAccess('export_vsc_excel') && <button className="button button--secondary">Export to Excel</button>}
          {canAccess('saved_vsc_views') && <button className="button button--secondary">Saved Views</button>}
        </div>

        <div className="card-list">
          {(filteredAndSortedContracts.length > 0) ? (
            filteredAndSortedContracts.map(contract => (
              <Card
                key={contract.id}
                title={`VSC: ${contract.id}`}
                description={`${contract.customerName} - ${contract.vehicle}`}
                status={contract.status}
                onClick={() => navigate('VSC_CONTRACT_DETAILS', { id: contract.id })}
              >
                <div className="card__meta">
                  <span>Plan: {contract.plan}</span>
                  <span>Effective: {contract.effectiveDate}</span>
                  <span>Expires: {contract.expirationDate}</span>
                </div>
              </Card>
            ))
          ) : (
            <div className="empty-state">
              <p>No Vehicle Service Contracts found matching your criteria.</p>
              {canAccess('create_vsc') && (
                <button className="button button--primary" onClick={() => navigate('CREATE_VSC')}>
                  Create New VSC
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const VSCContractDetailsScreen = () => {
    const { id } = view.params;
    const contract = dummyVSCContracts.find(c => c.id === id);

    if (!contract) {
      return (
        <div className="screen-content">
          <Breadcrumbs />
          <h1 className="screen-title">Contract Not Found</h1>
          <p>The Vehicle Service Contract with ID "{id}" could not be found.</p>
          <button className="button button--secondary" onClick={() => navigate('VSC_CONTRACTS')}>Back to VSCs</button>
        </div>
      );
    }

    const relatedClaims = dummyClaims.filter(claim => claim.vscId === contract.id);

    return (
      <div className="vsc-details-screen screen-content">
        <Breadcrumbs />
        <h1 className="screen-title">VSC Details: {contract.id}</h1>

        <div className="detail-header" style={{ borderLeftColor: STATUS_COLORS[contract.status] }}>
          <div className="detail-header__main">
            <h2>{contract.customerName} - {contract.vehicle}</h2>
            <span className="detail-status" style={{ backgroundColor: STATUS_COLORS[contract.status] }}>
              {STATUS_MAP[contract.status]}
            </span>
          </div>
          <div className="detail-actions">
            {(canAccess('edit_vsc')) && (
                <button className="button button--primary" onClick={() => navigate('EDIT_VSC', { id: contract.id })}>
                Edit Contract
                </button>
            )}
            {(canAccess('renew_vsc') && contract.status === 'EXPIRED') && (
                <button className="button button--secondary" onClick={() => alert('Renew VSC functionality (not implemented)')}>
                Renew Contract
                </button>
            )}
            {(canAccess('cancel_vsc') && contract.status === 'ACTIVE') && (
                <button className="button button--danger" onClick={() => alert('Cancel VSC functionality (not implemented)')}>
                Cancel Contract
                </button>
            )}
          </div>
        </div>

        <section className="detail-section">
          <h3>Workflow Status</h3>
          <WorkflowTracker stages={VSC_WORKFLOW_STAGES} currentStage={contract.workflowStage} slaStatus={contract.slaStatus} />
          <div className="sla-indicator">
              SLA Status: <span className={`sla-indicator__dot sla-indicator__dot--${contract.slaStatus?.toLowerCase()}`}></span> {contract.slaStatus}
              {(contract.slaStatus === 'Red') && <span className="sla-indicator__breach"> (Breached)</span>}
          </div>
        </section>

        <section className="detail-section">
          <h3>Contract Information</h3>
          <div className="detail-grid">
            <div className="detail-item"><strong>Plan:</strong> <span>{contract.plan}</span></div>
            <div className="detail-item"><strong>Premium:</strong> <span>${contract.premium?.toLocaleString()}</span></div>
            <div className="detail-item"><strong>Effective Date:</strong> <span>{contract.effectiveDate}</span></div>
            <div className="detail-item"><strong>Expiration Date:</strong> <span>{contract.expirationDate}</span></div>
            <div className="detail-item"><strong>Customer:</strong> <span>{contract.customerName}</span></div>
            <div className="detail-item"><strong>Vehicle:</strong> <span>{contract.vehicle}</span></div>
          </div>
        </section>

        <section className="detail-section">
          <h3>Related Claims</h3>
          <div className="card-list">
            {(relatedClaims.length > 0) ? (
              relatedClaims.map(claim => (
                <Card
                  key={claim.id}
                  title={`Claim: ${claim.id}`}
                  description={`${claim.claimType} - Requested $${claim.amountRequested}`}
                  status={claim.status}
                  onClick={() => navigate('CLAIM_DETAILS', { id: claim.id })}
                  type="mini"
                >
                  <div className="card__meta">
                    <span>Submitted: {claim.submittedDate}</span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="empty-state">
                <p>No related claims found.</p>
                {canAccess('file_claim') && (
                  <button className="button button--secondary" onClick={() => navigate('FILE_CLAIM', { vscId: contract.id })}>
                    File a New Claim
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="detail-section">
            <h3>Audit Log</h3>
            <div className="audit-log">
                {/* Dummy Audit Log */}
                <div className="audit-log__item">
                    <span className="audit-log__timestamp">2024-03-25 10:00 AM</span>
                    <span className="audit-log__user">System</span>
                    <span className="audit-log__action">Contract initiated.</span>
                </div>
                <div className="audit-log__item">
                    <span className="audit-log__timestamp">2024-03-26 09:30 AM</span>
                    <span className="audit-log__user">F&I Product Manager</span>
                    <span className="audit-log__action">Plan 'Gold Plus' selected.</span>
                </div>
                {(canAccess('system_logs')) && ( // Role-based visibility for logs
                    <div className="audit-log__item">
                        <span className="audit-log__timestamp">2024-03-26 11:00 AM</span>
                        <span className="audit-log__user">System Architect</span>
                        <span className="audit-log__action">API call to underwriting service successful.</span>
                    </div>
                )}
            </div>
        </section>
      </div>
    );
  };

  const ClaimDetailsScreen = () => {
    const { id } = view.params;
    const claim = dummyClaims.find(c => c.id === id);

    if (!claim) {
      return (
        <div className="screen-content">
          <Breadcrumbs />
          <h1 className="screen-title">Claim Not Found</h1>
          <p>The Claim with ID "{id}" could not be found.</p>
          <button className="button button--secondary" onClick={() => navigate('CLAIMS')}>Back to Claims</button>
        </div>
      );
    }

    const associatedVSC = dummyVSCContracts.find(vsc => vsc.id === claim.vscId);

    return (
      <div className="claim-details-screen screen-content">
        <Breadcrumbs />
        <h1 className="screen-title">Claim Details: {claim.id}</h1>

        <div className="detail-header" style={{ borderLeftColor: STATUS_COLORS[claim.status] }}>
          <div className="detail-header__main">
            <h2>{claim.claimType} for {claim.customerName}</h2>
            <span className="detail-status" style={{ backgroundColor: STATUS_COLORS[claim.status] }}>
              {STATUS_MAP[claim.status]}
            </span>
          </div>
          <div className="detail-actions">
            {(canAccess('adjudicate_claim') && (claim.status === 'IN_REVIEW' || claim.status === 'PENDING_APPROVAL' || claim.status === 'UNDER_REVIEW')) && (
                <button className="button button--primary" onClick={() => alert('Adjudicate Claim functionality (not implemented)')}>
                Adjudicate Claim
                </button>
            )}
            {(canAccess('edit_claim') && (claim.status === 'DRAFT' || claim.status === 'IN_REVIEW')) && (
                <button className="button button--secondary" onClick={() => alert('Edit Claim functionality (not implemented)')}>
                Edit Claim
                </button>
            )}
          </div>
        </div>

        <section className="detail-section">
          <h3>Workflow Status</h3>
          <WorkflowTracker stages={CLAIM_WORKFLOW_STAGES} currentStage={claim.workflowStage} slaStatus={claim.slaStatus} />
          <div className="sla-indicator">
              SLA Status: <span className={`sla-indicator__dot sla-indicator__dot--${claim.slaStatus?.toLowerCase()}`}></span> {claim.slaStatus}
              {(claim.slaStatus === 'Red') && <span className="sla-indicator__breach"> (Breached)</span>}
          </div>
        </section>

        <section className="detail-section">
          <h3>Claim Information</h3>
          <div className="detail-grid">
            <div className="detail-item"><strong>Claim Type:</strong> <span>{claim.claimType}</span></div>
            <div className="detail-item"><strong>Amount Requested:</strong> <span>${claim.amountRequested?.toLocaleString()}</span></div>
            <div className="detail-item"><strong>Submitted Date:</strong> <span>{claim.submittedDate}</span></div>
            <div className="detail-item"><strong>Customer:</strong> <span>{claim.customerName}</span></div>
            <div className="detail-item"><strong>Vehicle:</strong> <span>{claim.vehicle}</span></div>
          </div>
        </section>

        {(associatedVSC) && (
          <section className="detail-section">
            <h3>Associated VSC</h3>
            <Card
              title={`VSC: ${associatedVSC.id}`}
              description={`${associatedVSC.customerName} - ${associatedVSC.vehicle}`}
              status={associatedVSC.status}
              onClick={() => navigate('VSC_CONTRACT_DETAILS', { id: associatedVSC.id })}
              type="related"
            >
                <div className="card__meta">
                    <span>Plan: {associatedVSC.plan}</span>
                    <span>Expires: {associatedVSC.expirationDate}</span>
                </div>
            </Card>
          </section>
        )}

        <section className="detail-section">
            <h3>Documents</h3>
            <div className="document-list">
                <div className="document-item">
                    <span>Service Invoice.pdf</span>
                    <button className="button button--icon" onClick={() => alert('Preview Document (not implemented)')}>📄</button>
                    <button className="button button--icon" onClick={() => alert('Download Document (not implemented)')}>⬇️</button>
                </div>
                <div className="document-item">
                    <span>Vehicle Report.pdf</span>
                    <button className="button button--icon" onClick={() => alert('Preview Document (not implemented)')}>📄</button>
                    <button className="button button--icon" onClick={() => alert('Download Document (not implemented)')}>⬇️</button>
                </div>
                {canAccess('upload_claim_documents') && (
                  <button className="button button--secondary button--icon-left" onClick={() => alert('Upload Document functionality (not implemented)')}>
                    <span>Upload Document</span>
                  </button>
                )}
            </div>
        </section>
      </div>
    );
  };

  const CreateEditVSCFormScreen = () => {
    const { id } = view.params;
    const isEditing = !!id;
    const contractToEdit = isEditing ? dummyVSCContracts.find(c => c.id === id) : null;

    const [formData, setFormData] = useState({
      customerName: contractToEdit?.customerName || '',
      vehicle: contractToEdit?.vehicle || '',
      plan: contractToEdit?.plan || '',
      effectiveDate: contractToEdit?.effectiveDate || '',
      expirationDate: contractToEdit?.expirationDate || '',
      premium: contractToEdit?.premium || '',
      status: contractToEdit?.status || 'DRAFT',
      file: null, // For file upload
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    };

    const handleFileChange = (e) => {
      setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }));
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.customerName) newErrors.customerName = 'Customer Name is mandatory.';
      if (!formData.vehicle) newErrors.vehicle = 'Vehicle details are mandatory.';
      if (!formData.plan) newErrors.plan = 'Plan selection is mandatory.';
      if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective Date is mandatory.';
      if (!formData.expirationDate) newErrors.expirationDate = 'Expiration Date is mandatory.';
      if (!formData.premium || isNaN(formData.premium) || formData.premium <= 0) newErrors.premium = 'Premium must be a positive number.';
      return newErrors;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        alert('Please correct the form errors.');
        return;
      }

      console.log('VSC Form Submitted:', formData);
      alert(`VSC ${isEditing ? 'updated' : 'created'} successfully!`);
      navigate('VSC_CONTRACTS');
    };

    return (
      <div className="form-screen screen-content">
        <Breadcrumbs />
        <h1 className="screen-title">{isEditing ? `Edit VSC: ${id}` : 'Create New VSC'}</h1>

        <form onSubmit={(e) => handleSubmit(e)} className="app-form">
          <div className="form-group">
            <label htmlFor="customerName" className="form-label">Customer Name <span className="mandatory">*</span></label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              className={`input-field ${(errors.customerName) ? 'input-field--error' : ''}`}
              value={formData.customerName}
              onChange={(e) => handleChange(e)}
            />
            {(errors.customerName) && <p className="error-message">{errors.customerName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="vehicle" className="form-label">Vehicle <span className="mandatory">*</span></label>
            <input
              type="text"
              id="vehicle"
              name="vehicle"
              className={`input-field ${(errors.vehicle) ? 'input-field--error' : ''}`}
              value={formData.vehicle}
              onChange={(e) => handleChange(e)}
            />
            {(errors.vehicle) && <p className="error-message">{errors.vehicle}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="plan" className="form-label">Plan <span className="mandatory">*</span></label>
            <select
              id="plan"
              name="plan"
              className={`select-field ${(errors.plan) ? 'input-field--error' : ''}`}
              value={formData.plan}
              onChange={(e) => handleChange(e)}
            >
              <option value="">Select a Plan</option>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Silver Plus">Silver Plus</option>
              <option value="Gold">Gold</option>
              <option value="Gold Plus">Gold Plus</option>
              <option value="Platinum">Platinum</option>
            </select>
            {(errors.plan) && <p className="error-message">{errors.plan}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="effectiveDate" className="form-label">Effective Date <span className="mandatory">*</span></label>
            <input
              type="date"
              id="effectiveDate"
              name="effectiveDate"
              className={`input-field ${(errors.effectiveDate) ? 'input-field--error' : ''}`}
              value={formData.effectiveDate}
              onChange={(e) => handleChange(e)}
            />
            {(errors.effectiveDate) && <p className="error-message">{errors.effectiveDate}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="expirationDate" className="form-label">Expiration Date <span className="mandatory">*</span></label>
            <input
              type="date"
              id="expirationDate"
              name="expirationDate"
              className={`input-field ${(errors.expirationDate) ? 'input-field--error' : ''}`}
              value={formData.expirationDate}
              onChange={(e) => handleChange(e)}
            />
            {(errors.expirationDate) && <p className="error-message">{errors.expirationDate}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="premium" className="form-label">Premium ($) <span className="mandatory">*</span></label>
            <input
              type="number"
              id="premium"
              name="premium"
              className={`input-field ${(errors.premium) ? 'input-field--error' : ''}`}
              value={formData.premium}
              onChange={(e) => handleChange(e)}
            />
            {(errors.premium) && <p className="error-message">{errors.premium}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label">Status</label>
            <select
              id="status"
              name="status"
              className="select-field"
              value={formData.status}
              onChange={(e) => handleChange(e)}
            >
              {Object.keys(STATUS_MAP).map(key => (
                <option key={key} value={key}>{STATUS_MAP[key]}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="file" className="form-label">Upload Supporting Document</label>
            <input
              type="file"
              id="file"
              name="file"
              className="file-upload-input"
              onChange={(e) => handleFileChange(e)}
            />
            {(formData.file) && <p className="file-upload-info">Selected: {formData.file.name}</p>}
          </div>

          <div className="form-actions">
            <button type="submit" className="button button--primary">{isEditing ? 'Save Changes' : 'Create VSC'}</button>
            <button type="button" className="button button--secondary" onClick={() => navigate('VSC_CONTRACTS')}>Cancel</button>
          </div>
        </form>
      </div>
    );
  };

  const FileClaimFormScreen = () => {
    const { vscId } = view.params;
    const [formData, setFormData] = useState({
      vscId: vscId || '',
      claimType: '',
      description: '',
      amountRequested: '',
      submittedDate: new Date().toISOString().split('T')[0],
      file: null,
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; });
    };

    const handleFileChange = (e) => {
      setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }));
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.vscId) newErrors.vscId = 'Associated VSC ID is mandatory.';
      if (!formData.claimType) newErrors.claimType = 'Claim Type is mandatory.';
      if (!formData.amountRequested || isNaN(formData.amountRequested) || formData.amountRequested <= 0) newErrors.amountRequested = 'Amount Requested must be a positive number.';
      return newErrors;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        alert('Please correct the form errors.');
        return;
      }

      console.log('Claim Submitted:', formData);
      alert('Claim filed successfully and is under review!');
      navigate('CLAIMS');
    };

    return (
      <div className="form-screen screen-content">
        <Breadcrumbs />
        <h1 className="screen-title">File New Claim</h1>

        <form onSubmit={(e) => handleSubmit(e)} className="app-form">
          <div className="form-group">
            <label htmlFor="vscId" className="form-label">Associated VSC ID <span className="mandatory">*</span></label>
            <input
              type="text"
              id="vscId"
              name="vscId"
              className={`input-field ${(errors.vscId) ? 'input-field--error' : ''}`}
              value={formData.vscId}
              onChange={(e) => handleChange(e)}
              readOnly={!!vscId}
            />
            {(errors.vscId) && <p className="error-message">{errors.vscId}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="claimType" className="form-label">Claim Type <span className="mandatory">*</span></label>
            <input
              type="text"
              id="claimType"
              name="claimType"
              className={`input-field ${(errors.claimType) ? 'input-field--error' : ''}`}
              value={formData.claimType}
              onChange={(e) => handleChange(e)}
            />
            {(errors.claimType) && <p className="error-message">{errors.claimType}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="amountRequested" className="form-label">Amount Requested ($) <span className="mandatory">*</span></label>
            <input
              type="number"
              id="amountRequested"
              name="amountRequested"
              className={`input-field ${(errors.amountRequested) ? 'input-field--error' : ''}`}
              value={formData.amountRequested}
              onChange={(e) => handleChange(e)}
            />
            {(errors.amountRequested) && <p className="error-message">{errors.amountRequested}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              className="textarea-field"
              value={formData.description}
              onChange={(e) => handleChange(e)}
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="file" className="form-label">Upload Supporting Documents</label>
            <input
              type="file"
              id="file"
              name="file"
              className="file-upload-input"
              onChange={(e) => handleFileChange(e)}
              multiple
            />
            {(formData.file) && <p className="file-upload-info">Selected: {formData.file.name}</p>}
          </div>

          <div className="form-actions">
            <button type="submit" className="button button--primary">Submit Claim</button>
            <button type="button" className="button button--secondary" onClick={() => navigate('CLAIMS')}>Cancel</button>
          </div>
        </form>
      </div>
    );
  };

  const ClaimsScreen = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortBy, setSortBy] = useState('submittedDate');

    const filteredAndSortedClaims = dummyClaims
      .filter(claim =>
        (filterStatus === 'ALL' || claim.status === filterStatus) &&
        (claim.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         claim.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         claim.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         claim.claimType?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortBy === 'submittedDate') {
          return new Date(b.submittedDate) - new Date(a.submittedDate);
        }
        if (sortBy === 'amountRequested') {
          return (b.amountRequested || 0) - (a.amountRequested || 0);
        }
        return 0;
      });

    return (
        <div className="claims-screen screen-content">
            <Breadcrumbs />
            <h1 className="screen-title">Claims Management</h1>

            <div className="grid-controls">
                <input
                    type="text"
                    placeholder="Search Claims..."
                    className="input-field search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="select-field filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="ALL">All Statuses</option>
                    {Object.keys(STATUS_MAP).map(key => (
                    <option key={key} value={key}>{STATUS_MAP[key]}</option>
                    ))}
                </select>
                <select
                    className="select-field sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="submittedDate">Sort by Submitted Date (Newest)</option>
                    <option value="amountRequested">Sort by Amount (Highest)</option>
                </select>
                {canAccess('file_claim') && (
                  <button className="button button--primary" onClick={() => navigate('FILE_CLAIM')}>
                      + File New Claim
                  </button>
                )}
                {canAccess('bulk_actions_claims') && <button className="button button--secondary">Bulk Actions</button>}
                {canAccess('export_claims_excel') && <button className="button button--secondary">Export to Excel</button>}
            </div>

            <div className="card-list">
                {(filteredAndSortedClaims.length > 0) ? (
                    filteredAndSortedClaims.map(claim => (
                        <Card
                            key={claim.id}
                            title={`Claim: ${claim.id}`}
                            description={`${claim.claimType} for ${claim.customerName} (${claim.vehicle})`}
                            status={claim.status}
                            onClick={() => navigate('CLAIM_DETAILS', { id: claim.id })}
                        >
                            <div className="card__meta">
                                <span>VSC: {claim.vscId}</span>
                                <span>Requested: ${claim.amountRequested?.toLocaleString()}</span>
                                <span>Submitted: {claim.submittedDate}</span>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>No Claims found matching your criteria.</p>
                        {canAccess('file_claim') && (
                          <button className="button button--primary" onClick={() => navigate('FILE_CLAIM')}>
                              File a New Claim
                          </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
  };

  const NotFoundScreen = () => (
    <div className="screen-content not-found-screen">
      <h1 className="screen-title">404 - Page Not Found</h1>
      <p>The screen you are trying to access does not exist or you do not have permission.</p>
      <button className="button button--primary" onClick={() => navigate('DASHBOARD')}>Go to Dashboard</button>
    </div>
  );

  // --- Main App Render ---
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-logo" onClick={() => navigate('DASHBOARD')}>VSC App</h1>
        <nav className="main-nav">
          {(canAccess('dashboard')) && (
            <button className={`nav-item ${(view.screen === 'DASHBOARD') ? 'nav-item--active' : ''}`} onClick={() => navigate('DASHBOARD')}>Dashboard</button>
          )}
          {(canAccess('vsc_contracts')) && (
            <button className={`nav-item ${((view.screen === 'VSC_CONTRACTS') || (view.screen === 'VSC_CONTRACT_DETAILS') || (view.screen === 'CREATE_VSC') || (view.screen === 'EDIT_VSC')) ? 'nav-item--active' : ''}`} onClick={() => navigate('VSC_CONTRACTS')}>Contracts</button>
          )}
          {(canAccess('claims')) && (
            <button className={`nav-item ${((view.screen === 'CLAIMS') || (view.screen === 'CLAIM_DETAILS') || (view.screen === 'FILE_CLAIM')) ? 'nav-item--active' : ''}`} onClick={() => navigate('CLAIMS')}>Claims</button>
          )}
          {(canAccess('reports')) && (
            <button className="nav-item" onClick={() => alert('Reports Screen (not implemented)')}>Reports</button>
          )}
          {(canAccess('admin_settings')) && (
            <button className="nav-item" onClick={() => alert('Admin Settings Screen (not implemented)')}>Admin</button>
          )}
        </nav>
        <div className="user-profile">
          <input type="text" placeholder="Global Search..." className="search-bar" />
          <span className="user-avatar">{CURRENT_USER_ROLE.charAt(0)}</span>
          <span className="user-name">{CURRENT_USER_ROLE.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
          <button className="button button--icon" onClick={() => handleLogout()}>🚪</button>
        </div>
      </header>
      <main className="app-main">
        {(() => {
          if (!canAccess(view.screen) && view.screen !== 'NOT_FOUND') {
            return <NotFoundScreen />;
          }
          switch (view.screen) {
            case 'DASHBOARD':
              return <DashboardScreen />;
            case 'VSC_CONTRACTS':
              return <VSCContractsScreen />;
            case 'VSC_CONTRACT_DETAILS':
              return <VSCContractDetailsScreen />;
            case 'CREATE_VSC':
            case 'EDIT_VSC':
              return <CreateEditVSCFormScreen />;
            case 'CLAIMS':
              return <ClaimsScreen />;
            case 'CLAIM_DETAILS':
              return <ClaimDetailsScreen />;
            case 'FILE_CLAIM':
              return <FileClaimFormScreen />;
            case 'NOT_FOUND':
              return <NotFoundScreen />;
            default:
              return <NotFoundScreen />;
          }
        })()}
      </main>
    </div>
  );
}

export default App;