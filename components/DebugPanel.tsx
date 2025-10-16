'use client';

import React, { useState, useEffect, useContext, useRef } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Download, Trash2, Filter, RefreshCw } from 'lucide-react';
import { logger, LogLevel, LogEntry } from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface DebugPanelProps {
  enabled?: boolean;
  defaultExpanded?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'logs' | 'auth' | 'storage' | 'network'>('logs');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<LogLevel>(LogLevel.DEBUG);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const authContext = useAuth();
  const onboardingContext = useOnboarding();

  useEffect(() => {
    if (!enabled) return;

    const refreshLogs = () => {
      const filteredLogs = logger.getLogs({ level: logFilter, limit: 100 });
      setLogs(filteredLogs);
    };

    refreshLogs();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(refreshLogs, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [enabled, logFilter, autoRefresh]);

  useEffect(() => {
    if (autoRefresh && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoRefresh]);

  if (!enabled || !isVisible) {
    return enabled ? (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Show Debug Panel"
      >
        <Eye className="h-4 w-4" />
      </button>
    ) : null;
  }

  const formatLogLevel = (level: LogLevel) => {
    const levelMap = {
      [LogLevel.DEBUG]: { name: 'DEBUG', color: 'text-blue-500' },
      [LogLevel.INFO]: { name: 'INFO', color: 'text-green-500' },
      [LogLevel.WARN]: { name: 'WARN', color: 'text-yellow-500' },
      [LogLevel.ERROR]: { name: 'ERROR', color: 'text-red-500' }
    };
    return levelMap[level as keyof typeof levelMap] || { name: 'LOG', color: 'text-gray-500' };
  };

  const exportLogs = () => {
    const logData = logger.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatnil-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const getStorageData = () => {
    if (typeof window === 'undefined') return {};

    const data: Record<string, any> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            data[key] = JSON.parse(localStorage.getItem(key) || '');
          } catch {
            data[key] = localStorage.getItem(key);
          }
        }
      }
    } catch (error) {
      data.error = 'Failed to read localStorage';
    }
    return data;
  };

  const renderLogsTab = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <select
            value={logFilter}
            onChange={(e) => setLogFilter(Number(e.target.value) as LogLevel)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value={LogLevel.DEBUG}>All Logs</option>
            <option value={LogLevel.INFO}>Info+</option>
            <option value={LogLevel.WARN}>Warn+</option>
            <option value={LogLevel.ERROR}>Error Only</option>
          </select>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs px-2 py-1 rounded ${autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
          >
            Auto Refresh
          </button>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={exportLogs}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            title="Export Logs"
          >
            <Download className="h-3 w-3" />
          </button>
          <button
            onClick={clearLogs}
            className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
            title="Clear Logs"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="bg-black text-green-400 p-2 rounded text-xs font-mono max-h-64 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500">No logs available</div>
        ) : (
          logs.map((log, index) => {
            const levelInfo = formatLogLevel(log.level);
            return (
              <div key={index} className="mb-1">
                <span className="text-gray-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`ml-2 ${levelInfo.color} font-bold`}>
                  [{levelInfo.name}]
                </span>
                {log.context && (
                  <span className="ml-1 text-yellow-400">[{log.context}]</span>
                )}
                {log.source && (
                  <span className="ml-1 text-purple-400">({log.source})</span>
                )}
                <span className="ml-2">{log.message}</span>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="ml-4 mt-1 text-gray-300">
                    {JSON.stringify(log.metadata, null, 2)}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );

  const renderAuthTab = () => (
    <div className="space-y-3">
      <div className="bg-gray-50 p-3 rounded text-xs">
        <h4 className="font-bold mb-2">Auth Context State</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>User:</strong> {authContext?.user ? 'Authenticated' : 'Not authenticated'}
          </div>
          <div>
            <strong>Loading:</strong> {authContext?.isLoading ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Profile:</strong> {authContext?.user?.profile ? 'Loaded' : 'Not loaded'}
          </div>
          <div>
            <strong>Error:</strong> None
          </div>
        </div>
        {authContext?.user && (
          <div className="mt-2">
            <strong>User ID:</strong> {authContext.user.id}
            <br />
            <strong>Email:</strong> {authContext.user.email}
          </div>
        )}
        {authContext?.user?.profile && (
          <div className="mt-2">
            <strong>Profile:</strong>
            <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(authContext.user.profile, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-3 rounded text-xs">
        <h4 className="font-bold mb-2">Onboarding Context State</h4>
        <div className="text-gray-600">
          Context available: {onboardingContext ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );

  const renderStorageTab = () => {
    const storageData = getStorageData();

    return (
      <div className="space-y-3">
        <div className="bg-gray-50 p-3 rounded text-xs">
          <h4 className="font-bold mb-2">Local Storage</h4>
          <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-48">
            {JSON.stringify(storageData, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-50 p-3 rounded text-xs">
          <h4 className="font-bold mb-2">Storage Quota</h4>
          {typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage ? (
            <div id="storage-quota">Calculating...</div>
          ) : (
            <div>Storage API not supported</div>
          )}
        </div>
      </div>
    );
  };

  const renderNetworkTab = () => (
    <div className="space-y-3">
      <div className="bg-gray-50 p-3 rounded text-xs">
        <h4 className="font-bold mb-2">Network Status</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Online:</strong> {typeof navigator !== 'undefined' ? (navigator.onLine ? 'Yes' : 'No') : 'Unknown'}
          </div>
          <div>
            <strong>Connection:</strong> {typeof navigator !== 'undefined' && 'connection' in navigator ? 'Available' : 'Unknown'}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded text-xs">
        <h4 className="font-bold mb-2">Recent API Calls</h4>
        <div className="text-gray-600">
          API call monitoring not yet implemented
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-w-md">
      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-t-lg">
        <h3 className="text-sm font-bold text-gray-800">Debug Panel</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
            title="Hide Panel"
          >
            <EyeOff className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3">
          <div className="flex space-x-1 mb-3 border-b">
            {['logs', 'auth', 'storage', 'network'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1 text-xs font-medium capitalize rounded-t ${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-800 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {activeTab === 'logs' && renderLogsTab()}
            {activeTab === 'auth' && renderAuthTab()}
            {activeTab === 'storage' && renderStorageTab()}
            {activeTab === 'network' && renderNetworkTab()}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;