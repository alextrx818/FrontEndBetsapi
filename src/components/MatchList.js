import React, { useMemo } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MatchCard from './MatchCard';

// Priority order helper function
const getTournamentPriority = (tournamentName) => {
  if (!tournamentName) return 999; // Default lowest priority if no name
  
  const lowerName = tournamentName.toLowerCase();
  
  if (lowerName.includes('atp') && !lowerName.includes('challenger')) return 1; // ATP (highest)
  if (lowerName.includes('atp') && lowerName.includes('challenger')) return 2; // ATP Challenger
  if (lowerName.includes('wta')) return 3; // WTA
  if (lowerName.includes('utr')) return 4; // UTR
  if (lowerName.includes('itf')) return 5; // ITF
  
  return 50; // Other tournaments - middle priority
};

const MatchList = React.memo(({ matches }) => {
  console.log("MatchList received matches:", matches ? matches.length : 0);
  
  // Add more flexible filtering that doesn't require both APIs to have data
  const { displayableMatches, liveCount, totalCount } = useMemo(() => {
    // Check if matches exists and is an array
    if (!matches || !Array.isArray(matches) || matches.length === 0) {
      console.log("No valid matches received");
      return { displayableMatches: [], liveCount: 0, totalCount: 0 };
    }
    
    // Accept matches with data from at least one API source
    const displayableMatches = matches.filter(match => 
      match && match.match_id && (match.betsapi_data || match.rapid_data)
    );
    
    console.log(`Found ${displayableMatches.length} displayable matches`);
    
    const liveMatches = displayableMatches.filter(match => {
      const timeStatus = match.betsapi_data?.inplay_event?.time_status;
      const status = match.betsapi_data?.inplay_event?.ss;
      return timeStatus === '1' || 
             (status && status.toLowerCase().includes('in play'));
    });

    return {
      displayableMatches,
      liveCount: liveMatches.length,
      totalCount: displayableMatches.length
    };
  }, [matches]);

  // Sort matches by tournament priority
  const sortedMatches = useMemo(() => {
    if (!displayableMatches.length) return [];
    
    return [...displayableMatches].sort((a, b) => {
      // Get tournament/league name from either API source
      const tournamentA = 
        a.betsapi_data?.inplay_event?.league?.name || 
        a.rapid_data?.raw_event_data?.liga || 
        '';
      
      const tournamentB = 
        b.betsapi_data?.inplay_event?.league?.name || 
        b.rapid_data?.raw_event_data?.liga || 
        '';
      
      // Compare by priority
      return getTournamentPriority(tournamentA) - getTournamentPriority(tournamentB);
    });
  }, [displayableMatches]);

  if (sortedMatches.length === 0) {
    return (
      <Container>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" mr={2}>
            Tennis Matches
          </Typography>
          <Chip 
            label="No matches available" 
            color="default" 
            size="medium"
          />
        </Box>
        <Typography variant="body1" sx={{ mt: 4, textAlign: 'center' }}>
          No tennis matches are currently available. Please check back later.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1" mr={2}>
          Tennis Matches
        </Typography>
        <Chip 
          label={`${liveCount} live / ${totalCount} total`} 
          color="primary" 
          size="medium"
        />
      </Box>
      {sortedMatches.map((match, index) => (
        <MatchCard 
          key={`${match.match_id}-${index}`}
          match={match} 
          matchNumber={index + 1}
        />
      ))}
    </Container>
  );
});

MatchList.displayName = 'MatchList';

export default MatchList;