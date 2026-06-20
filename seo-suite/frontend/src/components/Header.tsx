import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, ShieldCheck, Sparkles, X, User, Sun, Moon, Settings, LogOut, ChevronDown } from 'lucide-react';
import { toast } from '../utils/toast';

interface HeaderProps {
  currentProject: string;
  setCurrentProject: (domain: string) => void;
  chatActive: boolean;
  onToggleChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentProject, setCurrentProject, chatActive, onToggleChat }) => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sync search input value with active project on load
  useEffect(() => {
    if (currentProject) {
      setSearchValue(currentProject);
    }
  }, [currentProject]);

  // Sync theme status on load
  useEffect(() => {
    setIsLightMode(document.documentElement.classList.contains('light-theme') || document.body.classList.contains('light-theme'));
  }, []);

  const toggleTheme = () => {
    const nextMode = !isLightMode;
    setIsLightMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
      toast.success('Light Theme Activated');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
      toast.success('Dark Theme Activated');
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch autocomplete suggestions as the user types (with debounce)
  useEffect(() => {
    if (!searchValue.trim() || searchValue === currentProject) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:3001/api/keywords/suggest?q=${encodeURIComponent(searchValue)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.suggestions) {
            setSuggestions(data.suggestions.map((s: any) => s.keyword));
          }
        }
      } catch (err) {
        console.error("Autocomplete fetch failed:", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchValue, currentProject]);

  const handleSearchSubmit = (valueToSearch: string) => {
    const cleanValue = valueToSearch.trim();
    if (!cleanValue) return;

    // Set the active project to the search value
    setCurrentProject(cleanValue);
    toast.success(`Active domain updated to: ${cleanValue}`);
    setShowDropdown(false);
  };

  return (
    <header className="header" style={{ position: 'fixed', zIndex: 1000 }}>
      <div className="header-inner" style={{ position: 'relative' }}>
        {/* Left Side: Brand Logo (SEMrush Style) */}
        <a href="#" className="header-brand">
          <span className="brand-icon">S</span>
          <span className="brand-text">SEO SUITE</span>
        </a>

        {/* Middle Side: Search Input with Autocomplete */}
        <div 
          ref={containerRef}
          className="header-search" 
          style={{ position: 'relative', width: '100%', maxWidth: '480px' }}
        >
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(searchValue); }}
            className="input-wrapper"
            style={{ width: '100%', display: 'flex', position: 'relative' }}
          >
            <input 
              type="text" 
              className="input-field" 
              value={searchValue}
              onChange={(e) => { setSearchValue(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Enter your task, website, or keyword..." 
              style={{ width: '100%', paddingRight: '40px' }}
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => { setSearchValue(''); setSuggestions([]); }}
                style={{
                  position: 'absolute',
                  right: '46px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--s-on-surface-variant)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={14} />
              </button>
            )}
            <button type="submit" className="input-btn">
              <Search size={16} />
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchValue.trim().length > 0 && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--c-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                marginTop: '6px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                zIndex: 1010,
                maxHeight: '260px',
                overflowY: 'auto',
                padding: '6px 0'
              }}
            >
              {/* If user typed domain, show quick action to change domain */}
              {searchValue.includes('.') && (
                <div 
                  onClick={() => handleSearchSubmit(searchValue)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--s-block-lilac-text)',
                    cursor: 'pointer',
                    backgroundColor: 'var(--s-surface-low)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--s-hairline-soft)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--s-surface-low)'}
                >
                  <Globe size={14} />
                  <span>Switch active project to "{searchValue}"</span>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 ? (
                suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSearchValue(sug);
                      handleSearchSubmit(sug);
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      color: 'var(--s-on-surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--s-hairline-soft)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Search size={13} style={{ color: 'var(--s-on-surface-variant)' }} />
                    <span>{sug}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '8px 16px', fontSize: '12px', color: 'var(--s-on-surface-variant)', fontStyle: 'italic' }}>
                  Press Enter to search/set "{searchValue}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Quick Actions & Settings */}
        <div className="header-actions">
          <div className="header-project-badge">
            <Globe size={14} />
            <span style={{ color: 'var(--s-primary)', fontWeight: '600' }}>Active:</span>
            <input 
              type="text" 
              value={currentProject} 
              onChange={(e) => {
                setCurrentProject(e.target.value);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontWeight: '600',
                outline: 'none',
                width: '120px',
                fontSize: '13px'
              }}
              placeholder="domain.com"
            />
          </div>

          <div className="badge badge-mint" style={{ gap: '4px', height: '32px', fontSize: '11px' }}>
            <ShieldCheck size={12} />
            <span>Local DB Active</span>
          </div>

          <button 
            className={`header-action-icon-btn ${chatActive ? 'active' : ''}`}
            onClick={onToggleChat}
            title="Gemini AI Assistant"
          >
            <Sparkles size={18} style={{ color: chatActive ? '#8b5cf6' : 'inherit' }} />
          </button>

          {/* Profile Dropdown Container */}
          <div ref={profileRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px',
                borderRadius: '24px',
                transition: 'background-color 0.2s',
              }}
              title="User Account"
            >
              <div 
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #a3e635, #60a5fa)', 
                  color: '#0f0f11', 
                  fontWeight: '700', 
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                JD
              </div>
              <ChevronDown size={12} style={{ color: 'var(--s-on-surface-variant)' }} />
            </button>

            {/* Profile Dropdown Panel */}
            {showProfileDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: '240px',
                  backgroundColor: 'var(--c-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  marginTop: '10px',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                  zIndex: 2000,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '12px',
                  gap: '10px',
                }}
              >
                {/* User Info Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #a3e635, #60a5fa)', color: '#0f0f11', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>JD</div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <strong style={{ fontSize: '13px', color: 'var(--s-on-surface)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>John Doe</strong>
                    <span style={{ fontSize: '10px', color: 'var(--s-on-surface-variant)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>john.doe@google.com</span>
                  </div>
                </div>

                {/* Dropdown Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--s-on-surface-variant)', letterSpacing: '0.04em', margin: '4px 0 2px 2px' }}>Settings</div>
                  
                  <button 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: '12px', color: 'var(--s-on-surface)', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--s-surface-low)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => { toast.info('Opened Profile Settings'); setShowProfileDropdown(false); }}
                  >
                    <User size={14} style={{ color: 'var(--s-on-surface-variant)' }} />
                    <span>My Profile</span>
                  </button>

                  <button 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: '12px', color: 'var(--s-on-surface)', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--s-surface-low)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => { toast.info('Opened API Configuration'); setShowProfileDropdown(false); }}
                  >
                    <Settings size={14} style={{ color: 'var(--s-on-surface-variant)' }} />
                    <span>API & Tool Setup</span>
                  </button>
                  
                  {/* Dynamic Theme Toggle Row */}
                  <button 
                    onClick={toggleTheme}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontSize: '12px', color: 'var(--s-on-surface)', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--s-surface-low)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isLightMode ? (
                        <Moon size={14} style={{ color: 'var(--s-on-surface-variant)' }} />
                      ) : (
                        <Sun size={14} style={{ color: 'var(--s-on-surface-variant)' }} />
                      )}
                      <span>{isLightMode ? 'Dark Theme' : 'Light Theme'}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--s-primary)', background: 'var(--s-surface-soft)', padding: '2px 6px', borderRadius: '4px' }}>
                      Toggle
                    </span>
                  </button>
                </div>

                {/* Footer Sign out */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                  <button 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: '12px', color: 'var(--s-red)', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => { toast.warning('Logging out...'); setShowProfileDropdown(false); }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
