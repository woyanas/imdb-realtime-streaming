import { useState, useEffect, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── helpers ────────────────────────────────────────────── */
const cleanText = t => t ? t.replace(/<br\s*\/?>/gi, ' ').trim() : '';

const getSentimentInfo = score =>
  (score === 1 || score === '1')
    ? { label: 'Positive', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '😊', arrow: '↑' }
    : { label: 'Negative', color: '#dc2626', bg: '#fff1f2', border: '#fecdd3', icon: '😞', arrow: '↓' };

/* ── Stat Card ──────────────────────────────────────────── */
const StatCard = ({ label, value, sub, color, bg, border, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    style={{
      background: bg,
      border: `1.5px solid ${border}`,
      borderRadius: 16,
      padding: '18px 22px',
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{label}</span>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
    </div>
    <motion.div
      key={value}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ fontSize: '2rem', fontWeight: 900, color, lineHeight: 1 }}
    >
      {typeof value === 'number' ? value.toLocaleString() : value}
    </motion.div>
    {sub && <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>{sub}</div>}
  </motion.div>
);

/* ── Donut Chart ─────────────────────────────────────────── */
const DonutChart = ({ positiveRate, total }) => {
  const r = 36, circ = 2 * Math.PI * r;
  const pos = (positiveRate / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: 90, height: 90 }}>
        <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          <circle cx="45" cy="45" r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
          <circle cx="45" cy="45" r={r} fill="none" stroke="#dc2626" strokeWidth="9"
            strokeDasharray={`${circ - pos} ${pos}`}
            strokeDashoffset={-pos} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
          <circle cx="45" cy="45" r={r} fill="none" stroke="#059669" strokeWidth="9"
            strokeDasharray={`${pos} ${circ - pos}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{positiveRate}%</div>
          <div style={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 600 }}>POSITIVE</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Pos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Neg</span>
        </div>
      </div>
    </div>
  );
};

/* ── Sparkline ───────────────────────────────────────────── */
const SparkLine = ({ history }) => {
  const W = 200, H = 44;
  const last = history.slice(-24);
  if (last.length < 2) return (
    <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Waiting for data…</span>
    </div>
  );
  const step = W / (last.length - 1);
  const pts = last.map((v, i) => `${i * step},${v === 1 ? 4 : H - 4}`).join(' ');
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="url(#sg)" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {last.map((v, i) => (
        <circle key={i} cx={i * step} cy={v === 1 ? 4 : H - 4} r="3"
          fill={v === 1 ? '#059669' : '#dc2626'}
          stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  );
};

/* ── Review Card ─────────────────────────────────────────── */
const ReviewCard = forwardRef(({ item }, ref) => {
  const [expanded, setExpanded] = useState(false);
  const info = getSentimentInfo(item.sentimentScore);
  const text = cleanText(item.reviewText);
  const isLong = text.length > 180;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: -20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      onClick={() => isLong && setExpanded(e => !e)}
      style={{
        background: '#ffffff',
        borderTop: `1.5px solid ${expanded ? info.border : '#e2e8f0'}`,
        borderRight: `1.5px solid ${expanded ? info.border : '#e2e8f0'}`,
        borderBottom: `1.5px solid ${expanded ? info.border : '#e2e8f0'}`,
        borderLeft: `5px solid ${info.color}`,
        borderRadius: 14,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        cursor: isLong ? 'pointer' : 'default',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      whileHover={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', y: -2 }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `linear-gradient(135deg, ${info.bg}, ${info.border})`,
            border: `2px solid ${info.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 800, color: info.color, flexShrink: 0,
          }}>
            {info.icon}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
              @{item.username}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>IMDB Reviewer</div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: info.bg,
          border: `1.5px solid ${info.border}`,
          borderRadius: 50,
          padding: '5px 12px',
          fontSize: '0.73rem',
          fontWeight: 800,
          color: info.color,
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 900 }}>{info.arrow}</span>
          {info.label}
        </div>
      </div>

      {/* Review text */}
      <p style={{
        fontSize: '0.875rem',
        lineHeight: 1.65,
        color: '#475569',
        margin: 0,
        display: '-webkit-box',
        WebkitLineClamp: expanded ? 'none' : 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {text || 'No review text available.'}
      </p>

      {/* Expand hint */}
      {isLong && (
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
          {expanded ? '▲ Show less' : '▼ Click to expand'}
        </div>
      )}

      {/* Sentiment progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: item.sentimentScore === 1 ? '75%' : '25%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', background: info.color, borderRadius: 4 }}
          />
        </div>
        <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>
          Sentiment Score
        </span>
      </div>
    </motion.div>
  );
});

/* ── Pipeline Steps ──────────────────────────────────────── */
const PipelineSteps = () => {
  const steps = [
    { icon: '🐘', name: 'PostgreSQL', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
    { icon: '🔄', name: 'Debezium', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
    { icon: '⚡', name: 'Kafka', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    { icon: '☕', name: 'Spring Boot', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    { icon: '⚛️', name: 'React', color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
      {steps.map((s, i) => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: s.bg, border: `1.5px solid ${s.border}`,
            borderRadius: 10, padding: '8px 10px', minWidth: 64,
          }}>
            <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: s.color, whiteSpace: 'nowrap' }}>{s.name}</span>
          </div>
          {i < steps.length - 1 && (
            <span style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 700 }}>→</span>
          )}
        </div>
      ))}
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────── */
const SentimentStream = ({ initialItems, latestSentiment, stats, connectionStatus }) => {
  const [items, setItems] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [paused, setPaused] = useState(false);
  const pauseRef = useRef(false);

  useEffect(() => { pauseRef.current = paused; }, [paused]);

  useEffect(() => {
    if (initialItems && initialItems.length > 0 && items.length === 0) {
      const mapped = initialItems.map(item => ({
        id: `${Date.now()}-${Math.random()}`,
        sentimentScore: item.sentimentScore,
        username: item.username,
        reviewText: item.reviewText || ''
      }));
      setItems(mapped);
      setScoreHistory(mapped.map(m => m.sentimentScore).reverse());
    }
  }, [initialItems]);

  useEffect(() => {
    if (!latestSentiment || pauseRef.current) return;
    const score = latestSentiment.sentimentScore ?? latestSentiment.sentiment_score;
    const newItem = {
      id: `${Date.now()}-${Math.random()}`,
      sentimentScore: score,
      username: latestSentiment.username,
      reviewText: latestSentiment.reviewText || latestSentiment.review_text || '',
    };
    setItems(prev => [newItem, ...prev].slice(0, 50));
    setScoreHistory(prev => [...prev, score].slice(-50));
  }, [latestSentiment]);

  const { total = 0, positive = 0, negative = 0, throughput = 0, positiveRate = 0, negativeRate = 0 } = stats || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <StatCard label="Total Reviews" value={total} sub="Streamed via Kafka CDC"
          color="#4f46e5" bg="#eef2ff" border="#c7d2fe" icon="📦" delay={0} />
        <StatCard label="Positive" value={positive} sub={`${positiveRate}% sentiment positive`}
          color="#059669" bg="#ecfdf5" border="#a7f3d0" icon="😊" delay={0.05} />
        <StatCard label="Negative" value={negative} sub={`${negativeRate}% sentiment negative`}
          color="#dc2626" bg="#fff1f2" border="#fecdd3" icon="😞" delay={0.1} />
        <StatCard label="Throughput" value={throughput} sub="reviews per minute"
          color="#d97706" bg="#fffbeb" border="#fde68a" icon="⚡" delay={0.15} />
      </div>

      {/* ── Main Panel ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* Feed */}
        <div style={{
          flex: 1, minWidth: 0,
          background: '#f8faff',
          border: '1.5px solid #e2e8f0',
          borderRadius: 20,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: '70vh',
          boxShadow: '0 4px 20px rgba(79,70,229,0.06)',
        }}>
          {/* Feed Header */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#ffffff',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 9, height: 9, borderRadius: '50%',
                background: connectionStatus === 'connected' ? '#059669' : '#f59e0b',
                boxShadow: connectionStatus === 'connected' ? '0 0 0 3px #d1fae5' : 'none',
              }} />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>
                Live Review Feed
              </span>
              {items.length > 0 && (
                <span style={{
                  background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe',
                  fontSize: '0.68rem', fontWeight: 700, padding: '2px 9px', borderRadius: 50,
                }}>
                  {items.length} reviews
                </span>
              )}
            </div>
            <button
              onClick={() => setPaused(p => !p)}
              style={{
                background: paused ? '#fffbeb' : '#eef2ff',
                border: `1.5px solid ${paused ? '#fde68a' : '#c7d2fe'}`,
                color: paused ? '#d97706' : '#4f46e5',
                borderRadius: 10, padding: '5px 14px',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.2px',
                transition: 'all 0.2s',
              }}
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
          </div>

          {/* Feed List */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '14px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <AnimatePresence initial={false} mode="popLayout">
              {items.map(item => <ReviewCard key={item.id} item={item} />)}
            </AnimatePresence>

            {items.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 16, padding: '60px 20px', flex: 1,
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: '#eef2ff', border: '2px solid #c7d2fe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem', animation: 'scan 3s ease-in-out infinite',
                }}>
                  📡
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
                    Waiting for Kafka events…
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Reviews will stream in automatically
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Donut */}
          <div style={{
            background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20,
            padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            <div style={{ alignSelf: 'flex-start', fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>
              Sentiment Split
            </div>
            <DonutChart positiveRate={positiveRate} total={total} />
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#059669' }}>{positive}</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>POSITIVE</div>
              </div>
              <div style={{ width: 1, background: '#f1f5f9' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#dc2626' }}>{negative}</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>NEGATIVE</div>
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div style={{
            background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20,
            padding: '20px', display: 'flex', flexDirection: 'column', gap: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>Recent Trend</div>
            <SparkLine history={scoreHistory} />
            <p style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Top = Positive · Bottom = Negative
            </p>
          </div>
        </div>
      </div>

      {/* ── Pipeline ─────────────────────────────────────────── */}
      <div style={{
        background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20,
        padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 14,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>🚀 End-to-End Data Pipeline</div>
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <PipelineSteps />
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        div::-webkit-scrollbar { width: 6px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
        div::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default SentimentStream;