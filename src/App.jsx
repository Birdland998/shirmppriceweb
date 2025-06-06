import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Components
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import PriceGrid from './components/PriceGrid'
import LoadingScreen from './components/LoadingScreen'
import PriceDetailModal from './components/PriceDetailModal'

// API Configuration - Fix the double slash issue
const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || 'https://hammerhead-app-2s5sw.ondigitalocean.app')
  : 'https://hammerhead-app-2s5sw.ondigitalocean.app';

// Remove trailing slash to prevent double slash in URLs
const CLEAN_API_URL = API_BASE_URL.replace(/\/$/, '');

console.log('🔧 Frontend Environment Info:', {
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
  apiUrl: CLEAN_API_URL,
  origin: window.location.origin
});

// Update the URL acceptance system
const ACCEPTED_URLS_KEY = 'accepted_backend_urls';
const ACCEPTED_DOMAINS_KEY = 'accepted_backend_domains';

const isUrlAccepted = (url) => {
  try {
    // Check exact URL
    const acceptedUrls = JSON.parse(localStorage.getItem(ACCEPTED_URLS_KEY) || '[]');
    if (acceptedUrls.includes(url)) return true;

    // Check domain
    const domain = new URL(url).hostname;
    const acceptedDomains = JSON.parse(localStorage.getItem(ACCEPTED_DOMAINS_KEY) || '[]');
    if (acceptedDomains.includes(domain)) return true;

    // Special case for ngrok domains
    if (domain.endsWith('.ngrok-free.app')) {
      const baseDomain = domain.split('.')[0];
      return acceptedDomains.some(d => d.endsWith('.ngrok-free.app') && d.split('.')[0] === baseDomain);
    }

    return false;
  } catch (e) {
    console.error('Error checking accepted URL:', e);
    return false;
  }
};

const acceptUrl = (url) => {
  try {
    // Accept exact URL
    const acceptedUrls = JSON.parse(localStorage.getItem(ACCEPTED_URLS_KEY) || '[]');
    if (!acceptedUrls.includes(url)) {
      acceptedUrls.push(url);
      localStorage.setItem(ACCEPTED_URLS_KEY, JSON.stringify(acceptedUrls));
    }

    // Accept domain
    const domain = new URL(url).hostname;
    const acceptedDomains = JSON.parse(localStorage.getItem(ACCEPTED_DOMAINS_KEY) || '[]');
    if (!acceptedDomains.includes(domain)) {
      acceptedDomains.push(domain);
      localStorage.setItem(ACCEPTED_DOMAINS_KEY, JSON.stringify(acceptedDomains));
    }
  } catch (e) {
    console.error('Failed to save accepted URL:', e);
  }
};

// Ngrok Warning Component
const NgrokWarning = ({ onDismiss, backendUrl }) => {
  const handleAccept = () => {
    acceptUrl(backendUrl);
    onDismiss();
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-0 left-0 right-0 bg-amber-500 text-white p-4 z-50 shadow-lg"
    >
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-semibold">Backend Access Required</span>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/80 hover:text-white transition-colors"
            title="Dismiss warning"
          >
            ✕
          </button>
        </div>
        <p className="text-sm mb-3">
          Please visit the backend URL to accept access:
        </p>
        <div className="flex flex-col gap-2">
          <a
            href={backendUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-amber-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors text-center"
          >
            Open Backend URL
          </a>
          <button
            onClick={handleAccept}
            className="inline-block bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors border border-amber-400"
          >
            Accept & Remember This URL
          </button>
        </div>
        <p className="text-xs mt-2 text-amber-100">
          After accepting, click the button above to remember this URL.
        </p>
      </div>
    </motion.div>
  );
};

function App() {
  // State Management
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [data, setData] = useState([])
  const [statistics, setStatistics] = useState({ min: 0, max: 0, avg: 0 })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [selectedItem, setSelectedItem] = useState(null)
  const [priceHistory, setPriceHistory] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState(null)
  const [isOnline, setIsOnline] = useState(true)
  const [apiStatus, setApiStatus] = useState('checking')
  const [showNgrokWarning, setShowNgrokWarning] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  
  // Use ref instead of state for initialization tracking
  const initRef = useRef(false)
  const healthCheckInProgress = useRef(false)

  // API Service Functions
  const apiService = {
    // Health check with improved CORS handling
    async healthCheck() {
      try {
        console.log('🔍 Checking API health...');
        console.log('🌐 API URL:', CLEAN_API_URL);
        console.log('🌐 Frontend Origin:', window.location.origin);
        
        // Check cached data first
        if (isUrlAccepted(CLEAN_API_URL)) {
          const cachedData = localStorage.getItem('cached_health_data');
          if (cachedData) {
            try {
              const data = JSON.parse(cachedData);
              if (data.timestamp && (Date.now() - new Date(data.timestamp).getTime() < 5 * 60 * 1000)) {
                console.log('✅ Using cached health data');
                setApiStatus('connected');
                setError(null);
                setErrorMessage(null);
                setShowNgrokWarning(false);
                return true;
              }
            } catch (e) {
              console.log('❌ Invalid cached data, proceeding with fresh check');
            }
          }
        }

        // Make the API request with proper CORS headers
        const response = await fetch(`${CLEAN_API_URL}/api/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials: 'include',
          cache: 'no-cache'
        });

        console.log('�� Response status:', response.status);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          if (response.status === 0 || response.status === 500) {
            console.error('❌ CORS or server error detected');
            throw new Error(`Server error: ${response.status}. Please check CORS configuration.`);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        console.log('📥 Raw response:', text.substring(0, 200));

        // Try to parse as JSON
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('❌ Invalid JSON response:', e);
          throw new Error('Invalid JSON response from server');
        }

        // Cache successful response
        if (data.status === 'healthy') {
          localStorage.setItem('cached_health_data', JSON.stringify({
            ...data,
            timestamp: new Date().toISOString()
          }));
          acceptUrl(CLEAN_API_URL);
        }

        if (data.status === 'healthy') {
          console.log('✅ API is healthy:', data);
          setApiStatus('connected');
          setError(null);
          setErrorMessage(null);
          setShowNgrokWarning(false);
          return true;
        } else {
          throw new Error(data.error || 'API health check failed');
        }
      } catch (error) {
        console.error('❌ Health check error:', error);
        
        // Handle specific error types
        if (error.message.includes('CORS') || error.message.includes('fetch')) {
          setApiStatus('error');
          setError('CORS_ERROR');
          setErrorMessage(`CORS Error: ${error.message}. Backend needs to allow origin: ${window.location.origin}`);
          return false;
        }

        // Use cached data if available
        if (isUrlAccepted(CLEAN_API_URL)) {
          console.log('⚠️ Error but URL is accepted, proceeding with cached data');
          setApiStatus('connected');
          setError(null);
          setErrorMessage(null);
          setShowNgrokWarning(false);
          return true;
        }

        setApiStatus('error');
        setError('CONNECTION_ERROR');
        setErrorMessage(error.message);
        return false;
      }
    },

    // Updated fetch methods with consistent URL handling
    async getCurrentPrices() {
      try {
        const response = await fetch(`${CLEAN_API_URL}/api/shrimp-prices`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials: 'include',
          cache: 'no-cache'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Cache successful response
        localStorage.setItem('cached_prices', JSON.stringify({
          prices: data,
          timestamp: new Date().toISOString()
        }));

        return data;
      } catch (error) {
        console.error('❌ Error fetching prices:', error);
        
        // Try cached data
        const cachedData = localStorage.getItem('cached_prices');
        if (cachedData) {
          try {
            const data = JSON.parse(cachedData);
            console.log('⚠️ Using cached prices due to error');
            return data.prices;
          } catch (e) {
            console.error('❌ Failed to use cached prices:', e);
          }
        }
        throw error;
      }
    },

    async getPriceHistory(size, days = 7) {
      try {
        const response = await fetch(`${CLEAN_API_URL}/api/shrimp-prices/history/${size}?days=${days}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`❌ Error fetching price history:`, error);
        throw error;
      }
    },

    async getStatistics() {
      try {
        const response = await fetch(`${CLEAN_API_URL}/api/statistics`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('❌ Error fetching statistics:', error);
        throw error;
      }
    }
  };

  // Load initial data
  const loadData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsRefreshing(true);
      setError(null);

      console.log('🔄 Loading data...');
      console.log('🌐 Using API URL:', CLEAN_API_URL);

      // Test API connection first
      const isHealthy = await apiService.healthCheck();
      
      // If ngrok warning is shown, don't proceed with other API calls
      if (showNgrokWarning) {
        console.log('⏸️ Pausing data load due to ngrok warning');
        return;
      }

      if (!isHealthy) {
        throw new Error('API health check failed');
      }

      // Fetch current prices and statistics in parallel
      const [pricesData, statsData] = await Promise.all([
        apiService.getCurrentPrices(),
        apiService.getStatistics()
      ]);

      // Transform data to match frontend format
      const transformedData = pricesData.map(item => ({
        size: item.size || item._id,
        price: item.price,
        status: item.status || 'stable',
        lastUpdated: new Date(item.lastUpdated),
        trend: item.trend || 'stable',
        id: item.id || `shrimp-${item.size || item._id}`,
        change: item.change || 0
      }));

      setData(transformedData);
      setStatistics(statsData);
      setLastUpdate(new Date());
      setIsOnline(true);

      console.log(`✅ Loaded ${transformedData.length} shrimp prices`);
      
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      
      setError(`Connection failed: ${error.message}`);
      setIsOnline(false);
      setApiStatus('disconnected');
      
      // If we have no data and failed to fetch, show mock data as fallback
    if (data.length === 0) {
        console.log('🔄 Loading fallback mock data...');
        setData(generateMockData());
        setStatistics(calculateMockStatistics());
      }
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  }, [data.length, showNgrokWarning]);

  // Generate mock data as fallback
  const generateMockData = useCallback(() => {
    const ACTUAL_SHRIMP_SIZES = [40, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150];
    
    const actualPrices = {
      40: 165, 50: 150, 55: 143, 60: 135, 65: 130, 70: 130, 75: 128, 80: 128,
      85: 120, 90: 120, 95: 118, 100: 117, 105: 115, 110: 115, 115: 115, 120: 115,
      125: 115, 130: 115, 135: 112, 140: 112, 145: 110, 150: 109
    };

    const getRandomStatus = () => {
      const statuses = ['up', 'down', 'stable'];
      const weights = [0.4, 0.3, 0.3];
      const random = Math.random();
      let cumulative = 0;
      
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) return statuses[i];
      }
      return 'stable';
    };

    return ACTUAL_SHRIMP_SIZES.map(size => {
      const basePrice = actualPrices[size] || (size * 3);
      const variation = (Math.random() - 0.5) * 10;
      const price = Math.max(Math.round(basePrice + variation), size * 2);
      
      return {
        size,
        price,
        status: getRandomStatus(),
        lastUpdated: new Date(),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        id: `shrimp-${size}`,
        change: Math.floor((Math.random() - 0.5) * 10)
      };
    });
  }, []);

  // Calculate statistics for mock data
  const calculateMockStatistics = useCallback(() => {
    const mockData = generateMockData();
    const prices = mockData.map(item => item.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    };
  }, [generateMockData]);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      // Prevent multiple initializations using ref
      if (initRef.current) {
        return;
      }
      
      initRef.current = true;
      
      try {
        // Load initial data
        await loadData();
        
        // Hide loading screen
        setTimeout(() => {
          setShowLoadingScreen(false);
        }, 2500);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      healthCheckInProgress.current = false;
    };
  }, [loadData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing && !isModalOpen && isOnline) {
        loadData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData, isRefreshing, isModalOpen, isOnline]);

  // Handle card click
  const handleCardClick = useCallback(async (item) => {
    try {
      setSelectedItem(item);
      setIsModalOpen(true);
      
      const history = await apiService.getPriceHistory(item.size, 7);
      setPriceHistory(history);
      
    } catch (error) {
      console.error('❌ Error fetching price history:', error);
      
      // Generate mock history as fallback
      const mockHistory = generateMockPriceHistory(item.size, item.price);
      setPriceHistory(mockHistory);
    }
  }, []);

  // Generate mock price history
  const generateMockPriceHistory = useCallback((size, currentPrice) => {
    const history = [];
    let price = currentPrice;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = (Math.random() - 0.5) * (size * 0.3);
      price = Math.max(price + variation, size * 2);
      
      history.push({
        date: date.toISOString(),
        price: Math.round(price),
        change: i === 6 ? 0 : Math.round(price - (history[history.length - 1]?.price || 0))
      });
    }
    
    return history;
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
      setPriceHistory([]);
    }, 300);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    await loadData(true);
  }, [isRefreshing, loadData]);

  // Handle network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!isRefreshing) {
        loadData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadData, isRefreshing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleRefresh();
      }
      
      if (e.key === 'Escape' && isModalOpen) {
        handleModalClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleRefresh, isModalOpen, handleModalClose]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Show loading screen
  if (showLoadingScreen) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 max-w-sm mx-auto bg-white shadow-2xl relative overflow-hidden">
      {/* Ngrok Warning Banner */}
      <AnimatePresence>
        {showNgrokWarning && (
          <NgrokWarning 
            onDismiss={() => setShowNgrokWarning(false)} 
            backendUrl={CLEAN_API_URL}
          />
        )}
      </AnimatePresence>

      {/* Error Banner */}
      <AnimatePresence>
        {error && !showNgrokWarning && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-red-500 text-white p-3 text-center text-sm relative z-40"
          >
            <div className="flex items-center justify-center gap-2">
              <span>🔴</span>
              <span>{errorMessage || 'เชื่อมต่อ API ไม่ได้'}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-amber-500 text-white p-2 text-center text-sm relative z-50"
          >
            <div className="flex items-center justify-center gap-2">
              <span>📶</span>
              <span>ออฟไลน์ - แสดงข้อมูลแคช</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Header lastUpdate={lastUpdate} isOnline={isOnline && apiStatus === 'connected'} />
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={itemVariants}>
          <SummaryCards statistics={statistics} />
        </motion.div>

        {/* Price Grid */}
        <motion.div variants={itemVariants}>
          <PriceGrid data={data} onCardClick={handleCardClick} />
        </motion.div>

        {/* Footer Info */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4 text-center text-sm"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              isOnline && apiStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-gray-300">
              {isOnline && apiStatus === 'connected' ? 'API เชื่อมต่อแล้ว' : 'API ออฟไลน์'}
            </span>
          </div>
          <div>
          <span className="text-gray-300">อัปเดตล่าสุด:</span>
          <span className="font-semibold text-blue-300 ml-2">
            {new Date(lastUpdate).toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })} น.
          </span>
          </div>
          
         
        </motion.div>
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-xs mx-4">
              <div className="w-10 h-10 border-4 border-shrimp-500/20 border-t-shrimp-500 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-shrimp-500 font-semibold">กำลังอัปเดตราคา...</div>
              <div className="text-xs text-gray-500 mt-2">จาก API Server</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price Detail Modal */}
      <PriceDetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        priceHistory={priceHistory}
      />

      {/* Floating Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`
          fixed bottom-6 right-6 w-14 h-14 
          bg-gradient-to-r from-shrimp-500 to-shrimp-600 
          text-white rounded-full shadow-xl 
          hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 
          transition-all duration-300 flex items-center justify-center 
          text-xl z-40 disabled:opacity-50
          ${isRefreshing ? 'animate-spin' : ''}
          ${!isOnline || apiStatus === 'disconnected' ? 'opacity-50' : ''}
        `}
        title={isOnline && apiStatus === 'connected' ? 'รีเฟรชข้อมูล' : 'API ออฟไลน์'}
      >
        🔄
      </button>

      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-shrimp-50/50 via-transparent to-ocean-50/50" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-shrimp-100 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-ocean-100 to-transparent rounded-full blur-2xl" />
      </div>
    </div>
  );
}

export default App;
