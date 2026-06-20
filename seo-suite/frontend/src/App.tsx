import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { toast } from './utils/toast';

// Import all 20 advanced modular tools
import SiteAuditTool from './pages/tools/SiteAuditTool';
import PageSpeedTool from './pages/tools/PageSpeedTool';
import RedirectTracerTool from './pages/tools/RedirectTracerTool';
import SslSecurityTool from './pages/tools/SslSecurityTool';
import KeywordMagicTool from './pages/tools/KeywordMagicTool';
import PositionTrackingTool from './pages/tools/PositionTrackingTool';
import UrlMapperTool from './pages/tools/UrlMapperTool';
import KeywordGapTool from './pages/tools/KeywordGapTool';
import OnPageCheckerTool from './pages/tools/OnPageCheckerTool';
import SchemaGeneratorTool from './pages/tools/SchemaGeneratorTool';
import SocialMetadataTool from './pages/tools/SocialMetadataTool';
import ReadabilityTool from './pages/tools/ReadabilityTool';
import BacklinksTool from './pages/tools/BacklinksTool';
import BrokenLinksTool from './pages/tools/BrokenLinksTool';
import BacklinkGapTool from './pages/tools/BacklinkGapTool';
import AnchorTextTool from './pages/tools/AnchorTextTool';
import LocalCitationsTool from './pages/tools/LocalCitationsTool';
import MobileUxTool from './pages/tools/MobileUxTool';
import SitemapValidatorTool from './pages/tools/SitemapValidatorTool';
import PdfExporterTool from './pages/tools/PdfExporterTool';
import { Competitor } from './pages/Competitor';
import { AiChatPanel } from './components/AiChatPanel';

// Traffic & Local SEO Pages
import TrafficOverview from './pages/traffic/TrafficOverview';
import DailyTrends from './pages/traffic/DailyTrends';
import TopPages from './pages/traffic/TopPages';
import ListingManagement from './pages/local/ListingManagement';
import ReviewManagement from './pages/local/ReviewManagement';
import MapRankTracker from './pages/local/MapRankTracker';

const App: React.FC = () => {
  const [activePrimaryTab, setActivePrimaryTab] = useState<string>('home');
  const [activeSubpageTab, setActiveSubpageTab] = useState<string>('dashboard');
  const [currentProject, setCurrentProject] = useState<string>('smallpdf.com');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [chatActive, setChatActive] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<{ id: number; message: string; type: string } | null>(null);

  useEffect(() => {
    let timer: any;
    const unsubscribe = toast.subscribe((message, type) => {
      const id = Date.now();
      setActiveToast({ id, message, type });
      
      clearTimeout(timer);
      timer = setTimeout(() => {
        setActiveToast(null);
      }, 3000);
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const renderContent = () => {
    // Route page displays depending on subpage tabs
    switch (activeSubpageTab) {
      case 'dashboard':
        return (
          <Dashboard 
            currentProject={currentProject} 
            setActivePrimaryTab={setActivePrimaryTab}
            setActiveSubpageTab={setActiveSubpageTab}
            setIsCollapsed={setIsCollapsed}
          />
        );
      
      // 1. Diagnostics
      case 'site-audit':
        return <SiteAuditTool />;
      case 'pagespeed':
        return <PageSpeedTool />;
      case 'redirect-tracer':
        return <RedirectTracerTool />;
      case 'ssl-security':
        return <SslSecurityTool />;
      
      // 2. Keywords
      case 'keyword-magic':
        return <KeywordMagicTool />;
      case 'position-tracking':
        return <PositionTrackingTool />;
      case 'url-mapper':
        return <UrlMapperTool />;
      case 'keyword-gap':
        return <KeywordGapTool />;

      // 3. On-Page & Content
      case 'onpage-checker':
        return <OnPageCheckerTool />;
      case 'schema-generator':
        return <SchemaGeneratorTool />;
      case 'social-metadata':
        return <SocialMetadataTool />;
      case 'readability':
        return <ReadabilityTool />;

      // 4. Links
      case 'backlinks':
        return <BacklinksTool />;
      case 'broken-links':
        return <BrokenLinksTool />;
      case 'backlink-gap':
        return <BacklinkGapTool />;
      case 'anchor-text':
        return <AnchorTextTool />;

      // 5. Utilities
      case 'local-citations':
        return <LocalCitationsTool />;
      case 'mobile-friendly':
        return <MobileUxTool />;
      case 'sitemap-validator':
        return <SitemapValidatorTool />;
      case 'pdf-exporter':
        return <PdfExporterTool />;

      // 6. Traffic & Market
      case 'traffic-overview':
      case 'traffic-organic':
      case 'traffic-referral':
      case 'traffic-social':
      case 'traffic-direct':
      case 'geo-countries':
      case 'geo-regions':
      case 'audience-overlap':
        return <TrafficOverview currentProject={currentProject} />;
      case 'daily-trends':
        return <DailyTrends />;
      case 'top-pages':
      case 'subfolders':
        return <TopPages currentProject={currentProject} />;

      // 7. Local SEO
      case 'local-dashboard':
      case 'listing-management':
      case 'gbp-optimization':
      case 'gbp-ai-agent':
        return <ListingManagement />;
      case 'review-management':
        return <ReviewManagement />;
      case 'map-rank-tracker':
        return <MapRankTracker />;

      // Extra mock defaults
      case 'ads':
        return <Competitor />;
      case 'social':
        return <BacklinksTool />;
      default:
        return (
          <Dashboard 
            currentProject={currentProject}
            setActivePrimaryTab={setActivePrimaryTab}
            setActiveSubpageTab={setActiveSubpageTab}
            setIsCollapsed={setIsCollapsed}
          />
        );
    }
  };

  const isMenuCollapsed = isCollapsed || !['seo', 'traffic', 'local'].includes(activePrimaryTab);

  return (
    <div className="app app-container">
      <Sidebar 
        activePrimaryTab={activePrimaryTab} 
        setActivePrimaryTab={setActivePrimaryTab}
        activeSubpageTab={activeSubpageTab}
        setActiveSubpageTab={setActiveSubpageTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className={`main-content ${isMenuCollapsed ? 'sidebar-collapsed' : ''} ${chatActive ? 'chat-active' : ''}`}>
        <Header 
          currentProject={currentProject} 
          setCurrentProject={setCurrentProject} 
          chatActive={chatActive}
          onToggleChat={() => setChatActive(!chatActive)}
        />

        <div style={{ display: 'flex', flex: 1, minHeight: 0, width: '100%' }}>
          <main className="page-container" style={{ flex: 1, minWidth: 0 }}>
            {renderContent()}
          </main>

          <AiChatPanel 
            active={chatActive} 
            onClose={() => setChatActive(false)} 
            currentProject={currentProject} 
          />
        </div>
      </div>

      {activeToast && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: '#1b1b1b',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            border: '1px solid #333'
          }}
        >
          <span>
            {activeToast.type === 'success' ? '🟢' : activeToast.type === 'warning' ? '🟡' : activeToast.type === 'error' ? '🔴' : 'ℹ️'}
          </span>
          <span>{activeToast.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
