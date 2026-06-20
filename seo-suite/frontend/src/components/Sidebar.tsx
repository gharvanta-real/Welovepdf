import React from 'react';
import { 
  Home, 
  Search, 
  Megaphone, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  FileCode2,
  TrendingUp,
  Link2,
  Settings,
  KeyRound,
  Zap,
  RefreshCw,
  Lock,
  Globe,
  Scissors,
  CheckSquare,
  FileJson,
  Share2,
  BookOpen,
  MapPin,
  Smartphone,
  FileText,
  FileSpreadsheet,
  BarChart2,
  Activity,
  ArrowUpRight,
  Users,
  Star,
  Building2,
  Navigation,
  Map,
  LayoutGrid,
  Radio
} from 'lucide-react';

interface SidebarProps {
  activePrimaryTab: string;
  setActivePrimaryTab: (tab: string) => void;
  activeSubpageTab: string;
  setActiveSubpageTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePrimaryTab,
  setActivePrimaryTab,
  activeSubpageTab,
  setActiveSubpageTab,
  isCollapsed,
  setIsCollapsed
}) => {
  const primaryMenu = [
    { id: 'home',    label: 'Home',             icon: Home },
    { id: 'seo',     label: 'SEO Toolkit',       icon: Search },
    { id: 'traffic', label: 'Traffic & Market',  icon: BarChart2 },
    { id: 'local',   label: 'Local',             icon: MapPin },
    { id: 'ads',     label: 'Advertising',       icon: Megaphone },
    { id: 'social',  label: 'Social Media',      icon: MessageSquare },
  ];

  const seoSubpages = [
    {
      category: 'Site Diagnostics',
      items: [
        { id: 'site-audit',       label: 'Site Audit',           icon: FileCode2 },
        { id: 'pagespeed',        label: 'PageSpeed & UX',       icon: Zap },
        { id: 'redirect-tracer',  label: 'Redirect Path Tracer', icon: RefreshCw },
        { id: 'ssl-security',     label: 'SSL & Security',       icon: Lock },
      ]
    },
    {
      category: 'Keyword Research',
      items: [
        { id: 'keyword-magic',     label: 'Keyword Magic Tool',   icon: KeyRound },
        { id: 'position-tracking', label: 'Position Tracking',    icon: TrendingUp },
        { id: 'url-mapper',        label: 'Organic URL Mapper',   icon: Globe },
        { id: 'keyword-gap',       label: 'Keyword Gap',          icon: Scissors },
      ]
    },
    {
      category: 'On-Page & Content',
      items: [
        { id: 'onpage-checker',    label: 'On-Page SEO Checker',  icon: CheckSquare },
        { id: 'schema-generator',  label: 'Schema Generator',     icon: FileJson },
        { id: 'social-metadata',   label: 'Social Card Validator',icon: Share2 },
        { id: 'readability',       label: 'Readability & Tone',   icon: BookOpen },
      ]
    },
    {
      category: 'Link Building',
      items: [
        { id: 'backlinks',     label: 'Backlinks Explorer',   icon: Link2 },
        { id: 'broken-links',  label: 'Broken Link Finder',  icon: Link2 },
        { id: 'backlink-gap',  label: 'Backlink Gap',         icon: Scissors },
        { id: 'anchor-text',   label: 'Anchor Text Analyzer', icon: Link2 },
      ]
    },
    {
      category: 'Utilities',
      items: [
        { id: 'local-citations',    label: 'Local Citations',      icon: MapPin },
        { id: 'mobile-friendly',    label: 'Mobile UX Checker',    icon: Smartphone },
        { id: 'sitemap-validator',  label: 'Robots & Sitemap',     icon: FileText },
        { id: 'pdf-exporter',       label: 'PDF Report Exporter',  icon: FileSpreadsheet },
      ]
    }
  ];

  const trafficSubpages = [
    {
      category: 'Overview',
      items: [
        { id: 'traffic-overview',   label: 'Traffic Analytics',   icon: Activity },
        { id: 'daily-trends',       label: 'Daily Trends',        icon: TrendingUp },
      ]
    },
    {
      category: 'Traffic Distribution',
      items: [
        { id: 'traffic-organic',    label: 'Organic Search',      icon: Search },
        { id: 'traffic-referral',   label: 'Referral',            icon: Link2 },
        { id: 'traffic-social',     label: 'Social',              icon: Share2 },
        { id: 'traffic-direct',     label: 'Direct',              icon: ArrowUpRight },
      ]
    },
    {
      category: 'Pages & Content',
      items: [
        { id: 'top-pages',          label: 'Top Pages',           icon: LayoutGrid },
        { id: 'subfolders',         label: 'Subfolders & Subdomains', icon: FileCode2 },
      ]
    },
    {
      category: 'Regional Trends',
      items: [
        { id: 'geo-countries',      label: 'Countries',           icon: Globe },
        { id: 'geo-regions',        label: 'Regions',             icon: Map },
      ]
    },
    {
      category: 'Audience',
      items: [
        { id: 'audience-overlap',   label: 'Audience Overlap',    icon: Users },
      ]
    }
  ];

  const localSubpages = [
    {
      category: 'Overview',
      items: [
        { id: 'local-dashboard',    label: 'Dashboard',           icon: Home },
      ]
    },
    {
      category: 'Listing & Reviews',
      items: [
        { id: 'listing-management', label: 'Listing Management',  icon: Building2 },
        { id: 'review-management',  label: 'Review Management',   icon: Star },
        { id: 'gbp-optimization',   label: 'GBP Optimization',    icon: CheckSquare },
      ]
    },
    {
      category: 'Automations',
      items: [
        { id: 'gbp-ai-agent',       label: 'GBP AI Agent',        icon: Radio },
      ]
    },
    {
      category: 'Competitive Analysis',
      items: [
        { id: 'map-rank-tracker',   label: 'Map Rank Tracker',    icon: Navigation },
      ]
    }
  ];

  // Map which tab maps to which subpages definition
  const subpagesMap: Record<string, typeof seoSubpages> = {
    seo:     seoSubpages,
    traffic: trafficSubpages,
    local:   localSubpages,
  };

  const sidebarTitles: Record<string, string> = {
    seo:     'SEO Toolkit',
    traffic: 'Traffic & Market',
    local:   'Local',
  };

  const defaultFirstItems: Record<string, string> = {
    seo:     'site-audit',
    traffic: 'traffic-overview',
    local:   'local-dashboard',
  };

  const handlePrimaryClick = (tabId: string) => {
    setActivePrimaryTab(tabId);
    if (tabId === 'home') {
      setIsCollapsed(true);
      setActiveSubpageTab('dashboard');
    } else if (subpagesMap[tabId]) {
      setIsCollapsed(false);
      setActiveSubpageTab(defaultFirstItems[tabId] || tabId);
    } else {
      setIsCollapsed(true);
      setActiveSubpageTab(tabId);
    }
  };

  const hasSubpages = Boolean(subpagesMap[activePrimaryTab]);
  const currentSubpages = subpagesMap[activePrimaryTab] || [];
  const currentTitle = sidebarTitles[activePrimaryTab] || '';

  return (
    <div style={{ display: 'flex' }}>
      {/* 1. Narrow Primary Icon Sidebar */}
      <aside className="primary-sidebar">
        <div className="primary-menu">
          {primaryMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activePrimaryTab === item.id;
            return (
              <button
                key={item.id}
                className={`primary-item ${isActive ? 'active' : ''}`}
                onClick={() => handlePrimaryClick(item.id)}
              >
                <Icon size={20} />
                <span className="primary-item-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <button className="primary-item">
            <Settings size={20} />
            <span className="primary-item-label">Settings</span>
          </button>
        </div>
      </aside>

      {/* 2. Collapsible Secondary Subpage Sidebar */}
      <aside className={`secondary-sidebar ${isCollapsed || !hasSubpages ? 'collapsed' : ''}`}>
        <div className="secondary-header">
          <span className="secondary-title">{currentTitle}</span>
          <button 
            className="collapse-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand menu" : "Collapse menu"}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="secondary-menu">
          {currentSubpages.map((group, gIdx) => (
            <div key={gIdx} className="category-group">
              <span className="category-label">{group.category}</span>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSubpageTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`secondary-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveSubpageTab(item.id)}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Re-expand button floating when collapsed */}
      {isCollapsed && hasSubpages && (
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            position: 'fixed',
            left: '72px',
            top: '70px',
            zIndex: 99,
            backgroundColor: 'var(--c-surface)',
            color: 'var(--s-on-surface)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}
          title="Expand menu"
        >
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};
