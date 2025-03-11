import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const DataAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        // Fetch analysis data from the backend API
        const response = await fetch('http://localhost:8000/api/tennis/analysis');
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === 'error') {
          throw new Error(data.error || 'Unknown error occurred');
        }
        setAnalysis(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAnalysis();
    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(fetchAnalysis, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6">Error: {error}</Typography>
      </Container>
    );
  }

  if (!analysis) {
    return (
      <Container>
        <Typography>No data available for analysis</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Tennis Match Analysis</Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Tournament Analysis" />
        <Tab label="Status Analysis" />
        <Tab label="Time Analysis" />
      </Tabs>
      
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Overview</Typography>
              <Typography>Total Matches: {analysis.basic_analysis.total_matches}</Typography>
              <Typography>Matches with Rapid Data: {analysis.basic_analysis.matches_with_rapid_data}</Typography>
              <Typography>Matches with BetsAPI Data: {analysis.basic_analysis.matches_with_betsapi_data}</Typography>
              <Typography>Matches with Odds: {analysis.basic_analysis.matches_with_odds}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Data Completeness</Typography>
              <Typography>Rapid Data: {analysis.basic_analysis.data_completeness.rapid_data_percentage}%</Typography>
              <Typography>BetsAPI Data: {analysis.basic_analysis.data_completeness.betsapi_data_percentage}%</Typography>
              <Typography>Odds Availability: {analysis.basic_analysis.data_completeness.odds_availability_percentage}%</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Data Source Overlap</Typography>
              <Typography>Both Sources: {analysis.data_source_overlap.both_sources} matches</Typography>
              <Typography>RapidAPI Only: {analysis.data_source_overlap.rapid_only} matches</Typography>
              <Typography>BetsAPI Only: {analysis.data_source_overlap.betsapi_only} matches</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Match Status Distribution</Typography>
              {Object.entries(analysis.basic_analysis.status_distribution).map(([status, count]) => (
                <Typography key={status}>{status || 'Unknown'}: {count} matches</Typography>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Top Tournaments</Typography>
              {analysis.tournament_analysis.top_tournaments.map((tournament) => {
                const tournamentData = analysis.tournament_analysis.tournament_counts[tournament];
                return (
                  <Box key={tournament} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">{tournament}</Typography>
                    <Typography>Matches: {tournamentData.match_count}</Typography>
                    <Typography>Rapid Data Coverage: {((tournamentData.has_rapid_data / tournamentData.match_count) * 100).toFixed(1)}%</Typography>
                    <Typography>BetsAPI Coverage: {((tournamentData.has_betsapi_data / tournamentData.match_count) * 100).toFixed(1)}%</Typography>
                  </Box>
                );
              })}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Matches by Country</Typography>
              {Object.entries(analysis.country_analysis).map(([country, count]) => (
                <Typography key={country}>{country || 'Unknown'}: {count} matches</Typography>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Match Status Analysis</Typography>
              {Object.entries(analysis.status_analysis).map(([status, data]) => (
                <Box key={status} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{status || 'Unknown'}</Typography>
                  <Typography>Matches: {data.match_count}</Typography>
                  <Typography>With Rapid Data: {data.has_rapid_data} ({((data.has_rapid_data / data.match_count) * 100).toFixed(1)}%)</Typography>
                  <Typography>With BetsAPI Data: {data.has_betsapi_data} ({((data.has_betsapi_data / data.match_count) * 100).toFixed(1)}%)</Typography>
                  <Typography>With Odds Available: {data.odds_available} ({((data.odds_available / data.match_count) * 100).toFixed(1)}%)</Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Matches by Hour (UTC)</Typography>
              {Object.entries(analysis.time_analysis.hour_distribution).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([hour, count]) => (
                <Typography key={hour}>Hour {hour}: {count} matches</Typography>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default DataAnalysis;