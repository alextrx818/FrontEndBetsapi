import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';

const LogViewer = () => {
  const [logData, setLogData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const logEndRef = useRef(null);

  const fetchLogData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/tennis/log');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.text();
      setLogData(data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error('Error fetching log data:', err);
      setError(`Failed to fetch log data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchLogData();
    
    // Set up automatic refresh every 30 seconds
    const interval = setInterval(fetchLogData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [logData]);

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">Tennis Bot Log</Typography>
          <Box>
            <Button 
              variant="contained" 
              onClick={fetchLogData} 
              disabled={loading}
              sx={{ mr: 2 }}
            >
              Refresh Log
            </Button>
            {lastUpdated && (
              <Typography variant="body2" component="span">
                Last updated: {lastUpdated}
              </Typography>
            )}
          </Box>
        </Box>
        
        {loading && !logData ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              maxHeight: '80vh', 
              overflow: 'auto',
              backgroundColor: '#1e1e1e',
              color: '#f0f0f0',
              fontFamily: 'Consolas, monospace',
              fontSize: '0.9rem',
              whiteSpace: 'pre-wrap'
            }}
          >
            {logData}
            <div ref={logEndRef} />
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default LogViewer;