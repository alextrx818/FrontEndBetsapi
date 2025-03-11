import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { JSONTree } from 'react-json-tree';

const DataLogger = () => {
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRawData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tennis/raw');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Raw data:', data);
      setRawData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching raw data:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRawData();
  }, []);

  const theme = {
    scheme: 'monokai',
    base00: '#ffffff', // Set background to white
    base01: '#f5f5f5',
    base02: '#e8e8e8',
    base03: '#d4d4d4',
    base04: '#c0c0c0',
    base05: '#333333',
    base06: '#282828',
    base07: '#1c1c1c',
    base08: '#00008B', // Dark blue for better readability
    base09: '#00008B',
    base0A: '#00008B',
    base0B: '#00008B',
    base0C: '#00008B',
    base0D: '#00008B',
    base0E: '#00008B',
    base0F: '#00008B'
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" component="h2">Raw JSON Data</Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : rawData ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            maxHeight: '80vh', 
            overflow: 'auto',
          }}
        >
          <JSONTree data={rawData} theme={theme} invertTheme={false} />
        </Paper>
      ) : (
        <Typography>No data available</Typography>
      )}
    </Box>
  );
};

export default DataLogger;