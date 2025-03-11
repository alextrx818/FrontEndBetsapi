import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MatchList from './components/MatchList';
import MatchDetail from './components/MatchDetail';
import RawDataViewer from './components/RawDataViewer';
import DataLogger from './components/DataLogger';
import SchemaViewer from './components/SchemaViewer';
import DataAnalysis from './components/DataAnalysis';
import './App.css';

// Constants for localStorage
const STORAGE_KEY = 'tennis_matches_data';
const STORAGE_TIMESTAMP_KEY = 'tennis_matches_timestamp';
const DATA_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Utility function to check if data has actually changed
const hasDataChanged = (oldData, newData) => {
  if (!oldData || !newData) return true;
  try {
    // Compare only essential match data to avoid unnecessary updates
    const oldMatches = oldData.map(m => ({
      id: m.match_id,
      score: m.betsapi_data?.inplay_event?.ss,
      status: m.betsapi_data?.inplay_event?.time_status
    }));
    const newMatches = newData.map(m => ({
      id: m.match_id,
      score: m.betsapi_data?.inplay_event?.ss,
      status: m.betsapi_data?.inplay_event?.time_status
    }));
    return JSON.stringify(oldMatches) !== JSON.stringify(newMatches);
  } catch (e) {
    console.error('Error comparing data:', e);
    return true;
  }
};

// Load saved matches data from localStorage with more robust error handling
const loadSavedMatches = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    
    if (savedData && savedTimestamp) {
      const timestamp = parseInt(savedTimestamp, 10);
      const now = Date.now();
      
      // Check if data is not too old
      if (now - timestamp < DATA_MAX_AGE_MS) {
        const parsedData = JSON.parse(savedData);
        console.log(`Loaded ${parsedData.length} matches from localStorage`);
        return Array.isArray(parsedData) ? parsedData : [];
      } else {
        console.log('Saved match data is too old, fetching fresh data');
      }
    }
  } catch (err) {
    console.error('Error loading saved matches:', err);
  }
  return [];
};

// Save matches data to localStorage with safety checks
const saveMatchesToStorage = (matchesData) => {
  if (!Array.isArray(matchesData) || matchesData.length === 0) {
    console.warn('Not saving empty or invalid match data to localStorage');
    return;
  }
  
  try {
    const dataToSave = JSON.stringify(matchesData);
    localStorage.setItem(STORAGE_KEY, dataToSave);
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
    console.log(`Saved ${matchesData.length} matches to localStorage`);
  } catch (err) {
    console.error('Error saving matches to localStorage:', err);
    
    // If we hit the storage limit, try to remove old data first
    if (err.name === 'QuotaExceededError') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
        console.log('Cleared localStorage due to quota exceeded');
      } catch (clearErr) {
        console.error('Failed to clear localStorage:', clearErr);
      }
    }
  }
};

function App() {
  // Load cached data before rendering
  const cachedMatches = loadSavedMatches();
  
  // Initialize state with data from localStorage if available
  const [matches, setMatches] = useState(cachedMatches);
  const [loading, setLoading] = useState(cachedMatches.length === 0);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(
    localStorage.getItem(STORAGE_TIMESTAMP_KEY) 
      ? new Date(parseInt(localStorage.getItem(STORAGE_TIMESTAMP_KEY), 10)).toLocaleTimeString() 
      : 'never'
  );
  
  const lastUpdateTime = useRef(Date.now());
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const updateTimeoutRef = useRef(null);
  const THROTTLE_INTERVAL = 3000; // 3 seconds
  
  // Enhanced set matches function with storage and timestamp update
  const updateMatches = useCallback((newMatchesData) => {
    if (Array.isArray(newMatchesData) && newMatchesData.length > 0) {
      setMatches(newMatchesData);
      saveMatchesToStorage(newMatchesData);
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
    }
  }, []);

  // Throttled setState function with optimization
  const throttledSetMatches = useCallback((newData) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTime.current;
      
      if (hasDataChanged(matches, newData) && timeSinceLastUpdate >= THROTTLE_INTERVAL) {
        updateMatches(newData);
        lastUpdateTime.current = now;
      }
    }, 100); // Small delay to batch rapid updates
  }, [matches, updateMatches]);

  // WebSocket connection with improved error handling
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    try {
      const ws = new WebSocket('ws://localhost:8000/ws');
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setError(null);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.matches && Array.isArray(data.matches) && data.matches.length > 0) {
            throttledSetMatches(data.matches);
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error - retrying...');
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to connect - retrying...');
    }
  }, [throttledSetMatches]);

  useEffect(() => {
    // If we already have data from localStorage, we still fetch fresh data
    const fetchInitialData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/tennis');
        if (response.data?.matches && Array.isArray(response.data.matches)) {
          throttledSetMatches(response.data.matches);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        // Only show error if we don't have cached data
        if (matches.length === 0) {
          setError(`Failed to fetch data: ${err.message}`);
          setLoading(false);
        }
      }
    };

    fetchInitialData();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [connectWebSocket, throttledSetMatches, matches.length]);

  return (
    <Router>
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Tennis Bot Dashboard
            </Typography>
            <Box>
              <Typography variant="caption" sx={{ mr: 2, color: 'lightgrey' }}>
                Last updated: {lastUpdated}
              </Typography>
              <Button color="inherit" component={Link} to="/">
                Matches
              </Button>
              <Button color="inherit" component={Link} to="/analysis">
                Analysis
              </Button>
              <Button color="inherit" component={Link} to="/raw-data">
                Raw Data
              </Button>
              <Button color="inherit" component={Link} to="/data-logger">
                Data Logger
              </Button>
              <Button color="inherit" component={Link} to="/schema-viewer">
                Schema Viewer
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Routes>
          <Route 
            path="/" 
            element={
              <Container sx={{ mt: 3 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading matches...</Typography>
                  </Box>
                ) : error && matches.length === 0 ? (
                  <Typography color="error">{error}</Typography>
                ) : (
                  <>
                    {error && (
                      <Typography color="warning.main" sx={{ mb: 2 }}>
                        {error} (showing cached data)
                      </Typography>
                    )}
                    <MatchList matches={matches} />
                  </>
                )}
              </Container>
            } 
          />
          <Route path="/match/:matchId" element={<MatchDetail matches={matches} />} />
          <Route path="/analysis" element={<DataAnalysis matches={matches} />} />
          <Route path="/raw-data" element={<RawDataViewer />} />
          <Route path="/data-logger" element={<DataLogger />} />
          <Route path="/schema-viewer" element={<SchemaViewer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
