import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, Plus, Sliders, ArrowUp, Sparkles, Activity, Zap, Search, Link, Check } from 'lucide-react';
import { toast } from '../utils/toast';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  modelUsed?: 'flash' | 'gemma26' | 'gemma31';
}

interface AiChatPanelProps {
  active: boolean;
  onClose: () => void;
  currentProject: string;
}

interface ModelMetrics {
  rpm: number;
  tpm: number; // in K (e.g. 6.52 represents 6.52K)
  rpd: number;
}

export const AiChatPanel: React.FC<AiChatPanelProps> = ({ active, onClose, currentProject }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);
  
  // Model Settings State
  const [selectedModel, setSelectedModel] = useState<'flash' | 'gemma26' | 'gemma31'>('flash');
  const [showModelModal, setShowModelModal] = useState(false);
  
  // Model Limits & Current Usage State
  const [usage, setUsage] = useState<Record<'flash' | 'gemma26' | 'gemma31', ModelMetrics>>({
    flash: { rpm: 2, tpm: 6.52, rpd: 4 },
    gemma26: { rpm: 1, tpm: 1.0, rpd: 1 },
    gemma31: { rpm: 1, tpm: 2.0, rpd: 1 }
  });

  // Limits
  const limits = {
    flash: { rpm: 13, tpm: 240, rpd: 450 },
    gemma26: { rpm: 13, tpm: 1000, rpd: 1400 },
    gemma31: { rpm: 13, tpm: 1000, rpd: 1400 }
  };

  // Panel Resizing State
  const [panelWidth, setPanelWidth] = useState(340);
  const [isDragging, setIsDragging] = useState(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      const minW = 280;
      const maxW = Math.min(600, window.innerWidth * 0.5);
      
      if (newWidth >= minW && newWidth <= maxW) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Check if limits exceeded before sending request
    const currentMetrics = usage[selectedModel];
    const currentLimits = limits[selectedModel];
    
    if (currentMetrics.rpm >= currentLimits.rpm) {
      toast.error(`RPM Limit Reached (${currentLimits.rpm} requests/min). Please wait a moment.`);
      return;
    }
    if (currentMetrics.rpd >= currentLimits.rpd) {
      toast.error(`Daily Request Limit Reached (${currentLimits.rpd} requests/day).`);
      return;
    }

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Dynamic metrics increment helper
    const incrementMetrics = () => {
      // Estimate token count in K (roughly 0.5K to 2.5K depending on text size)
      const tokenEst = parseFloat((0.5 + Math.random() * 1.5 + textToSend.length * 0.003).toFixed(2));
      
      setUsage(prev => {
        const m = prev[selectedModel];
        return {
          ...prev,
          [selectedModel]: {
            rpm: Math.min(limits[selectedModel].rpm, m.rpm + 1),
            tpm: Math.min(limits[selectedModel].tpm, parseFloat((m.tpm + tokenEst).toFixed(2))),
            rpd: Math.min(limits[selectedModel].rpd, m.rpd + 1)
          }
        };
      });
    };

    try {
      const res = await fetch('http://127.0.0.1:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: textToSend, 
          domain: currentProject,
          model: selectedModel 
        })
      });
      const data = await res.json();
      
      // Increment metrics upon successful request/response loop
      incrementMetrics();
      
      if (data.reply) {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date(),
          modelUsed: selectedModel
        }]);
      }
    } catch (err) {
      console.error(err);
      
      // Still increment metrics since request was made
      incrementMetrics();
      
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: `Error connecting to local server. Make sure the backend is running.
Current Domain: **${currentProject}**`,
        timestamp: new Date(),
        modelUsed: selectedModel
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      content = content.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
      
      if (line.trim().startsWith('- ')) {
        return (
          <li key={idx} style={{ marginLeft: '16px', marginBottom: '4px' }} dangerouslySetInnerHTML={{ __html: content.substring(2) }} />
        );
      }
      return (
        <p key={idx} style={{ marginBottom: '8px', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: content }} />
      );
    });
  };

  const getModelName = (modelKey: 'flash' | 'gemma26' | 'gemma31') => {
    switch (modelKey) {
      case 'flash': return 'Gemini 3.1 Flash Lite';
      case 'gemma26': return 'Gemma 4 26B';
      case 'gemma31': return 'Gemma 4 31B';
    }
  };

  const starterPrompts = [
    { label: "Audit site", query: "audit site", icon: Activity, color: '#10b981' },
    { label: "Speed metrics", query: "check speed metrics", icon: Zap, color: '#f59e0b' },
    { label: "Keyword ideas", query: "organic keyword ideas", icon: Search, color: '#3b82f6' },
    { label: "Broken links", query: "broken links check", icon: Link, color: '#ec4899' }
  ];

  const renderProgressBar = (current: number, limit: number, color: string) => {
    const pct = Math.min(100, (current / limit) * 100);
    return (
      <div style={{ height: '5px', backgroundColor: 'var(--s-hairline-soft)', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
      </div>
    );
  };

  return (
    <div 
      className={`ai-chat-panel ${active ? 'active' : ''}`} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        overflow: 'hidden',
        width: active ? `${panelWidth}px` : '0px',
        borderLeft: active ? '1px solid var(--border)' : 'none',
        transition: isDragging ? 'none' : 'width 0.2s ease, border-left 0.2s ease'
      }}
    >
      <div style={{ width: `${panelWidth}px`, display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0, position: 'relative' }}>
        
        {/* Drag Handle for Resizing */}
        <div 
          onMouseDown={startResize}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '6px',
            cursor: 'col-resize',
            zIndex: 1000,
            backgroundColor: isDragging ? 'var(--s-primary)' : 'transparent',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            if (!isDragging) e.currentTarget.style.backgroundColor = 'var(--s-hairline)';
          }}
          onMouseOut={(e) => {
            if (!isDragging) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        />
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: '#8b5cf6' }} />
              <h3 style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Gemini Assistant</h3>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--s-on-surface-variant)', paddingLeft: '24px' }}>
              Model: {getModelName(selectedModel)}
            </span>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--s-on-surface-variant)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: messages.length === 0 ? 'center' : 'flex-start' }}>
          {messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '12px', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--s-block-lilac)', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={22} style={{ color: '#8b5cf6' }} />
              </div>
              
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                letterSpacing: '-0.02em', 
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                lineHeight: '1.2'
              }}>
                Ask questions about your site
              </h2>
              
              <p style={{ fontSize: '12px', color: 'var(--s-on-surface-variant)', maxWidth: '270px', margin: '-8px 0 10px 0', lineHeight: '1.4' }}>
                Gemini can scan <strong>{currentProject}</strong> for SEO audits, speed metrics, keyword suggestions, or broken links.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', width: '100%' }}>
                {starterPrompts.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(p.query)}
                      style={{
                        background: 'var(--s-surface-low)',
                        border: '1px solid var(--border)',
                        borderRadius: '24px',
                        padding: '8px 14px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        color: 'var(--s-primary)',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--s-hairline-soft)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--s-surface-low)';
                      }}
                    >
                      <Icon size={13} style={{ color: p.color }} />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexDirection: m.sender === 'user' ? 'row-reverse' : 'row' }}>
                  <div 
                    style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      backgroundColor: m.sender === 'user' ? 'var(--s-block-lime)' : 'var(--s-block-lilac)', 
                      color: m.sender === 'user' ? 'var(--s-block-lime-text)' : 'var(--s-block-lilac-text)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      flexShrink: 0
                    }}
                  >
                    {m.sender === 'user' ? 'U' : 'AI'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '80%' }}>
                    <div 
                      style={{ 
                        background: m.sender === 'user' ? 'var(--s-surface-low)' : 'none', 
                        padding: m.sender === 'user' ? '10px 14px' : '0px', 
                        borderRadius: '16px', 
                        fontSize: '13px', 
                        border: m.sender === 'user' ? '1px solid var(--border)' : 'none'
                      }}
                    >
                      {renderMessageText(m.text)}
                    </div>
                    {m.sender === 'assistant' && m.modelUsed && (
                      <span style={{ fontSize: '9px', color: 'var(--s-on-surface-variant)', fontStyle: 'italic', marginTop: '2px', alignSelf: 'flex-start' }}>
                        Response via {getModelName(m.modelUsed)}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div 
                    style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      backgroundColor: 'var(--s-block-lilac)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Bot size={14} className="loading-spinner" />
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--s-on-surface-variant)' }}>
                    Thinking...
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={threadEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              border: '1px solid var(--border)', 
              borderRadius: '24px', 
              background: 'var(--s-surface-low)',
              padding: '8px 12px'
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Try asking Gemini..."
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                width: '100%',
                fontFamily: 'inherit',
                fontSize: '13px',
                resize: 'none',
                height: '52px',
                padding: '6px 4px',
                color: 'var(--c-text)'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', borderTop: '1px solid var(--s-hairline-soft)', paddingTop: '6px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  type="button" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-on-surface-variant)', padding: '4px' }}
                  title="Add attachment"
                >
                  <Plus size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModelModal(true)}
                  style={{ 
                    background: showModelModal ? 'var(--s-hairline-soft)' : 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: showModelModal ? 'var(--s-primary)' : 'var(--s-on-surface-variant)', 
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                  title="Tune options"
                >
                  <Sliders size={16} />
                </button>
              </div>
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                style={{ 
                  background: input.trim() ? '#a3e635' : 'var(--s-hairline)', 
                  color: input.trim() ? '#0f0f11' : 'var(--s-on-surface-variant)', 
                  border: 'none', 
                  cursor: input.trim() ? 'pointer' : 'default', 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </form>
          <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--s-on-surface-variant)', marginTop: '8px' }}>
            Gemini in Workspace can make mistakes. Learn more
          </div>
        </div>

        {/* Model Options sub-panel */}
        {showModelModal && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'var(--c-surface)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.08)',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Sub-panel Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} style={{ color: 'var(--s-primary)' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: 'var(--s-primary)' }}>AI Model Settings</h3>
              </div>
              <button 
                onClick={() => setShowModelModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--s-on-surface-variant)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-panel Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--s-on-surface-variant)', letterSpacing: '0.05em' }}>
                Select Active Model
              </div>

              {/* Model 1: Gemini 3.1 Flash Lite */}
              <div 
                onClick={() => { setSelectedModel('flash'); toast.success('Model changed to Gemini 3.1 Flash Lite'); }}
                style={{
                  border: selectedModel === 'flash' ? '2px solid var(--s-primary)' : '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  backgroundColor: selectedModel === 'flash' ? 'var(--s-surface-low)' : 'transparent',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {selectedModel === 'flash' && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--s-primary)' }}>
                    <Check size={16} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--s-on-surface)' }}>Gemini 3.1 Flash Lite</strong>
                  <span style={{ fontSize: '9px', color: 'var(--s-on-surface-variant)' }}>Text-out models</span>
                </div>
                
                {/* Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: 'var(--s-on-surface-variant)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>RPM (Requests/Min)</span>
                      <strong>{usage.flash.rpm} / {limits.flash.rpm}</strong>
                    </div>
                    {renderProgressBar(usage.flash.rpm, limits.flash.rpm, '#10b981')}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>TPM (Tokens/Min)</span>
                      <strong>{usage.flash.tpm}K / {limits.flash.tpm}K</strong>
                    </div>
                    {renderProgressBar(usage.flash.tpm, limits.flash.tpm, '#3b82f6')}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>RPD (Requests/Day)</span>
                      <strong>{usage.flash.rpd} / {limits.flash.rpd}</strong>
                    </div>
                    {renderProgressBar(usage.flash.rpd, limits.flash.rpd, '#f59e0b')}
                  </div>
                </div>
              </div>

              {/* Model 2: Gemma 4 26B */}
              <div 
                onClick={() => { setSelectedModel('gemma26'); toast.success('Model changed to Gemma 4 26B'); }}
                style={{
                  border: selectedModel === 'gemma26' ? '2px solid var(--s-primary)' : '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  backgroundColor: selectedModel === 'gemma26' ? 'var(--s-surface-low)' : 'transparent',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {selectedModel === 'gemma26' && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--s-primary)' }}>
                    <Check size={16} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--s-on-surface)' }}>Gemma 4 26B</strong>
                  <span style={{ fontSize: '9px', color: 'var(--s-on-surface-variant)' }}>Other models</span>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: 'var(--s-on-surface-variant)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>RPM (Requests/Min)</span>
                      <strong>{usage.gemma26.rpm} / {limits.gemma26.rpm}</strong>
                    </div>
                    {renderProgressBar(usage.gemma26.rpm, limits.gemma26.rpm, '#10b981')}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>TPM (Tokens/Min)</span>
                      <strong>{usage.gemma26.tpm.toFixed(2)}K / 1M</strong>
                    </div>
                    {renderProgressBar(usage.gemma26.tpm, limits.gemma26.tpm, '#3b82f6')}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>RPD (Requests/Day)</span>
                      <strong>{usage.gemma26.rpd} / 1.4K</strong>
                    </div>
                    {renderProgressBar(usage.gemma26.rpd, limits.gemma26.rpd, '#f59e0b')}
                  </div>
                </div>
              </div>

              {/* Model 3: Gemma 4 31B */}
              <div 
                onClick={() => { setSelectedModel('gemma31'); toast.success('Model changed to Gemma 4 31B'); }}
                style={{
                  border: selectedModel === 'gemma31' ? '2px solid var(--s-primary)' : '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  backgroundColor: selectedModel === 'gemma31' ? 'var(--s-surface-low)' : 'transparent',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {selectedModel === 'gemma31' && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--s-primary)' }}>
                    <Check size={16} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--s-on-surface)' }}>Gemma 4 31B</strong>
                  <span style={{ fontSize: '9px', color: 'var(--s-on-surface-variant)' }}>Other models</span>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: 'var(--s-on-surface-variant)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>RPM (Requests/Min)</span>
                      <strong>{usage.gemma31.rpm} / {limits.gemma31.rpm}</strong>
                    </div>
                    {renderProgressBar(usage.gemma31.rpm, limits.gemma31.rpm, '#10b981')}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>TPM (Tokens/Min)</span>
                      <strong>{usage.gemma31.tpm.toFixed(2)}K / 1M</strong>
                    </div>
                    {renderProgressBar(usage.gemma31.tpm, limits.gemma31.tpm, '#3b82f6')}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span>RPD (Requests/Day)</span>
                      <strong>{usage.gemma31.rpd} / 1.4K</strong>
                    </div>
                    {renderProgressBar(usage.gemma31.rpd, limits.gemma31.rpd, '#f59e0b')}
                  </div>
                </div>
              </div>

              {/* Informative Rate Limits Legend */}
              <div style={{ 
                fontSize: '10px', 
                lineHeight: '1.4', 
                color: 'var(--s-on-surface-variant)', 
                backgroundColor: 'var(--s-surface-low)', 
                padding: '10px', 
                borderRadius: '8px',
                border: '1px dashed var(--border)',
                marginTop: '8px'
              }}>
                <strong>Rate Limit Overrides Active:</strong>
                <ul style={{ margin: '4px 0 0 12px', padding: 0 }}>
                  <li>RPM scaled from 15 to 13.</li>
                  <li>Gemini TPM = 240K (was 250K), RPD = 450 (was 500).</li>
                  <li>Gemma TPM = 1M (was Unlimited), RPD = 1.4K (was 1.5K).</li>
                </ul>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
