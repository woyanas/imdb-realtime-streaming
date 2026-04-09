import { useState, useEffect, useRef } from 'react';
import SentimentStream from './components/SentimentStream';
import WebSocketService from './services/websocket';
import './App.css';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, throughput: 0 });
  const [latestSentiment, setLatestSentiment] = useState(null);
  const [initialItems, setInitialItems] = useState([]);
  const throughputRef = useRef([]);
  const throughputTimerRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial historical state
    fetch('http://localhost:8080/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({
          ...prev,
          total: data.total || 0,
          positive: data.positive || 0,
          negative: data.negative || 0
        }));
        if (data.items) {
           setInitialItems(data.items);
        }
        // 2. Connect WebSocket after fetching initial
        connectWebSocket();
      })
      .catch(err => {
        console.error("Failed to fetch initial stats", err);
        connectWebSocket(); // Fallback
      });

    throughputTimerRef.current = setInterval(() => {
      const now = Date.now();
      throughputRef.current = throughputRef.current.filter(t => now - t < 60000);
      setStats(prev => ({ ...prev, throughput: throughputRef.current.length }));
    }, 2000);
    return () => {
      clearInterval(throughputTimerRef.current);
      WebSocketService.disconnect();
    };
  }, []);

  const connectWebSocket = () => {
    WebSocketService.connect(
      () => {
        setConnectionStatus('connected');
        WebSocketService.subscribe('/topic/sentiment', (data) => {
          throughputRef.current.push(Date.now());
          const isPositive = (data.sentimentScore ?? data.sentiment_score) === 1;
          setStats(prev => ({
            ...prev,
            total: prev.total + 1,
            positive: isPositive ? prev.positive + 1 : prev.positive,
            negative: isPositive ? prev.negative : prev.negative + 1,
          }));
          setLatestSentiment(data);
        });
      },
      () => setConnectionStatus('error'),
      () => setConnectionStatus('disconnected')
    );
  };

  const positiveRate = stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0;
  const negativeRate = 100 - positiveRate;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="brand-icon">🎬</div>
            <div className="brand-text">
              <h1>IMDB Sentiment Stream</h1>
              <p>Real-Time Kafka · CDC · WebSocket Pipeline</p>
            </div>
          </div>
          <div className="header-right">
            <div className="tech-pills">
              {['PostgreSQL', 'Debezium', 'Kafka', 'Spring Boot', 'React'].map(t => (
                <span key={t} className="tech-pill">{t}</span>
              ))}
            </div>
            <div className={`connection-badge ${connectionStatus}`}>
              <span className={`conn-dot ${connectionStatus === 'connected' ? 'pulse' : ''}`} />
              {connectionStatus === 'connected' ? '● Live' : connectionStatus === 'error' ? '✗ Error' : '○ Connecting…'}
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <SentimentStream
          initialItems={initialItems}
          latestSentiment={latestSentiment}
          stats={{ ...stats, positiveRate, negativeRate }}
          connectionStatus={connectionStatus}
        />
      </main>

      <footer className="app-footer">
        <p>
          Real-time pipeline: <span>PostgreSQL → Debezium CDC → Apache Kafka → Spring Boot → WebSocket → React</span>
        </p>
      </footer>
    </div>
  );
}

export default App;