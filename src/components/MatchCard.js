import React, { memo } from 'react';
import { Card, CardContent, Typography, Box, Chip, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Custom comparison function for memoization
const arePropsEqual = (prevProps, nextProps) => {
  const prevMatch = prevProps.match;
  const nextMatch = nextProps.match;
  
  // Compare only the essential properties that affect rendering
  return (
    prevProps.matchNumber === nextProps.matchNumber &&
    prevMatch.match_id === nextMatch.match_id &&
    prevMatch.betsapi_data?.inplay_event?.home?.name === nextMatch.betsapi_data?.inplay_event?.home?.name &&
    prevMatch.betsapi_data?.inplay_event?.away?.name === nextMatch.betsapi_data?.inplay_event?.away?.name &&
    prevMatch.betsapi_data?.inplay_event?.ss === nextMatch.betsapi_data?.inplay_event?.ss &&
    prevMatch.betsapi_data?.inplay_event?.time_status === nextMatch.betsapi_data?.inplay_event?.time_status &&
    prevMatch.betsapi_data?.inplay_event?.league?.name === nextMatch.betsapi_data?.inplay_event?.league?.name
  );
};

const MatchCard = memo(({ match, matchNumber }) => {
  const navigate = useNavigate();
  const { match_id, betsapi_data } = match;
  
  // Destructure all required data at once to avoid deep property access during render
  const {
    home = { name: 'Unknown' },
    away = { name: 'Unknown' },
    ss: score = 'N/A',
    time_status: status = 'N/A',
    odds = 'N/A',
    league = { name: 'Unknown Tournament' }
  } = betsapi_data?.inplay_event || {};

  // Use constant styles to prevent recreation on each render
  const cardStyle = {
    mb: 2, 
    cursor: 'pointer',
    '&:hover': {
      boxShadow: 6,
      transform: 'scale(1.01)',
      transition: 'all 0.2s ease-in-out'
    }
  };

  const avatarStyle = { 
    bgcolor: 'primary.main', 
    width: 30, 
    height: 30, 
    mr: 2,
    fontSize: '0.875rem'
  };

  return (
    <Card sx={cardStyle} onClick={() => navigate(`/match/${match_id}`)}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Avatar sx={avatarStyle}>
              #{matchNumber}
            </Avatar>
            <Typography variant="h6" component="div">
              {home.name} vs {away.name}
            </Typography>
          </Box>
          <Chip 
            label={league.name} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="body2" color="text.secondary">
            Match ID: {match_id}
          </Typography>
          <Typography variant="body1" component="div">
            Score: {score}
          </Typography>
          <Typography variant="body1" component="div">
            Status: {status}
          </Typography>
          <Typography variant="body1" component="div">
            Odds: {odds}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}, arePropsEqual);

MatchCard.displayName = 'MatchCard';

export default MatchCard;