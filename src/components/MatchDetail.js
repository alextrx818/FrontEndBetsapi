import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { formatOdds } from '../utils/oddsConverter';

// Function to check if a field is an odds field
const isOddsField = (name, path) => {
  const oddsFields = [
    'odds',
    'outcome_odds',
    'moneyline',
    'handicap_odds',
    'over_odds',
    'under_odds'
  ];
  const oddsPathTerms = [
    'odds.moneyline',
    'odds.handicap',
    'odds.total',
    'markets.odds',
    'outcomes.odds'
  ];
  
  // Check if the field name itself is an odds field
  if (oddsFields.includes(name)) return true;
  
  // Check if the path contains odds-related terms
  if (path && oddsPathTerms.some(term => path.includes(term))) return true;
  
  return false;
};

// Utility function to get value color
const getValueColor = (val) => {
  if (val === null) return '#999';
  switch (typeof val) {
    case 'number': return '#0077cc';
    case 'boolean': return '#009688';
    case 'string': return '#d32f2f';
    default: return '#000000';
  }
};

const MatchDetail = ({ matches }) => {
  const { matchId } = useParams();
  const match = matches.find(m => m.match_id === matchId);
  const [activeTab, setActiveTab] = useState(0);
  
  // Initialize expandedNodes with a function that pre-expands all nodes
  const initializeExpandedNodes = () => {
    if (!match) return {};
    
    const expandedNodes = {};
    
    const traverseAndExpand = (data, path = '') => {
      if (typeof data !== 'object' || data === null) {
        return;
      }
      
      // Always set the current path to expanded
      expandedNodes[path] = true;
      
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          const newPath = path ? `${path}-${index}` : `${index}`;
          // Set array index path to expanded
          expandedNodes[newPath] = true;
          traverseAndExpand(item, newPath);
        });
      } else {
        Object.entries(data).forEach(([key, value]) => {
          const newPath = path ? `${path}-${key}` : key;
          // Set object key path to expanded
          expandedNodes[newPath] = true;
          traverseAndExpand(value, newPath);
        });
      }
    };
    
    // Set the root nodes to expanded
    expandedNodes['betsapi'] = true;
    expandedNodes['rapid'] = true;
    
    if (match.betsapi_data) {
      traverseAndExpand(match.betsapi_data, 'betsapi');
    }
    if (match.rapid_data) {
      traverseAndExpand(match.rapid_data, 'rapid');
    }
    
    return expandedNodes;
  };
  
  // Use the fully expanded nodes by default
  const [expandedNodes, setExpandedNodes] = useState(initializeExpandedNodes);
  
  // Move hooks to top level
  const toggleNode = useCallback((nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  }, []);

  // Memoize JsonTreeNode component - moved to top level
  const JsonTreeNode = useMemo(() => {
    return React.memo(({ data, name, path, depth = 0 }) => {
      const nodeId = path || name;
      const isExpanded = expandedNodes[nodeId] || false;
      const isPrimitive = typeof data !== 'object' || data === null;
      
      const handleExpandClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleNode(nodeId);
      };

      if (isPrimitive) {
        let displayValue = data === null ? 'null' : JSON.stringify(data);
        // Only convert to odds format if it's specifically an odds field
        if (isOddsField(name, path) && !isNaN(data)) {
          displayValue = formatOdds(data);
        }

        return (
          <ListItem 
            sx={{ 
              pl: depth * 2,
              py: 0.5,
              borderLeft: depth > 0 ? '1px dashed #eee' : 'none',
              display: 'flex',
              alignItems: 'center',
              color: '#000',
              userSelect: 'text',
            }}
            disableRipple
            dense
          >
            <Box sx={{ ml: 3.75 }} />
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography 
                component="span" 
                variant="body2"
                sx={{ 
                  fontWeight: 'bold',
                  mr: 0.5,
                  color: '#000',
                }}
              >
                {name}:
              </Typography>
              <Typography 
                component="span" 
                variant="body2"
                sx={{ 
                  fontFamily: 'monospace',
                  color: getValueColor(data),
                  fontWeight: typeof data === 'boolean' ? 'bold' : 'normal',
                }}
              >
                {displayValue}
              </Typography>
            </Box>
          </ListItem>
        );
      }

      const isArray = Array.isArray(data);
      const isEmpty = isArray ? data.length === 0 : Object.keys(data).length === 0;

      if (isEmpty) {
        return (
          <ListItem 
            sx={{ 
              pl: depth * 2,
              py: 0.5,
              borderLeft: depth > 0 ? '1px dashed #eee' : 'none',
              display: 'flex',
              alignItems: 'center',
              color: '#000',
            }}
            disableRipple
            dense
          >
            <Box sx={{ ml: 3.75 }} />
            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                component="span" 
                variant="body2"
                sx={{ 
                  fontWeight: 'bold',
                  mr: 0.5,
                  color: '#000',
                }}
              >
                {name}:
              </Typography>
              <Typography 
                component="span" 
                variant="body2"
                sx={{ 
                  color: '#666',
                  fontFamily: 'monospace',
                }}
              >
                {isArray ? '[]' : '{}'}
              </Typography>
            </Box>
          </ListItem>
        );
      }

      return (
        <>
          <ListItem 
            sx={{ 
              pl: depth * 2,
              py: 0.5,
              borderLeft: depth > 0 ? '1px dashed #eee' : 'none',
              display: 'flex',
              alignItems: 'center',
              color: '#000',
            }}
            disableRipple
            dense
          >
            <Box
              onClick={handleExpandClick}
              sx={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#666',
                minWidth: 24,
                minHeight: 24,
                justifyContent: 'center',
              }}
            >
              {isExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
            </Box>
            <Typography 
              variant="body2"
              sx={{ 
                ml: 0.5,
                fontWeight: 'bold',
                color: '#000',
              }}
            >
              {name}{isArray ? ` [${data.length}]` : ''}:
            </Typography>
          </ListItem>
          
          <Collapse in={isExpanded} timeout={100}>
            <List component="div" disablePadding dense>
              {isArray ? (
                data.map((item, index) => (
                  <JsonTreeNode 
                    key={`${nodeId}-${index}`} 
                    data={item} 
                    name={`[${index}]`} 
                    path={`${nodeId}-${index}`}
                    depth={depth + 1} 
                  />
                ))
              ) : (
                Object.entries(data).map(([key, value]) => (
                  <JsonTreeNode 
                    key={`${nodeId}-${key}`} 
                    data={value} 
                    name={key} 
                    path={`${nodeId}-${key}`}
                    depth={depth + 1} 
                  />
                ))
              )}
            </List>
          </Collapse>
        </>
      );
    }, (prevProps, nextProps) => {
      return (
        prevProps.data === nextProps.data &&
        prevProps.name === nextProps.name &&
        prevProps.path === nextProps.path &&
        prevProps.depth === nextProps.depth
      );
    });
  }, [expandedNodes, toggleNode]);

  // Render the JSON Tree View tab content - moved to top level
  const jsonTreeContent = useMemo(() => {
    if (!match) return null;
    
    return (
      <Box sx={{ mt: 3 }}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 2, 
            bgcolor: '#fff',
            maxHeight: '700px', 
            overflow: 'auto',
          }}
        >
          <List dense>
            {match.betsapi_data && (
              <JsonTreeNode 
                data={match.betsapi_data} 
                name="BetsAPI Data" 
                path="betsapi"
              />
            )}
            {match.rapid_data && (
              <JsonTreeNode 
                data={match.rapid_data} 
                name="RapidAPI Data" 
                path="rapid"
              />
            )}
          </List>
        </Paper>
      </Box>
    );
  }, [match, JsonTreeNode]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Early return for no match
  if (!match) {
    return (
      <Container>
        <Typography variant="h5" color="error">Match not found</Typography>
      </Container>
    );
  }

  // Helper function to render raw JSON data
  const renderJsonData = (data, title) => (
    <Box mb={3}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <pre style={{ overflow: 'auto', maxWidth: '100%' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </Paper>
    </Box>
  );

  // Helper function to extract and flatten fields
  const extractFields = (data, prefix = "") => {
    let fields = [];
    
    if (typeof data !== 'object' || data === null) {
      return fields;
    }
    
    if (Array.isArray(data)) {
      if (data.length > 0) {
        // For arrays, just use the first item to show structure
        fields.push({ 
          field: prefix + "[Array]", 
          type: "array", 
          value: `Array with ${data.length} item(s)` 
        });
        
        if (typeof data[0] === 'object' && data[0] !== null) {
          fields = fields.concat(extractFields(data[0], prefix + "[0]."));
        }
      } else {
        fields.push({ 
          field: prefix + "[Array]", 
          type: "array", 
          value: "Empty array" 
        });
      }
    } else {
      // Handle object
      for (const [key, value] of Object.entries(data)) {
        const fieldName = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            fields.push({ 
              field: fieldName, 
              type: "array", 
              value: `Array with ${value.length} item(s)` 
            });
            
            // Process first array item
            if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
              fields = fields.concat(extractFields(value[0], fieldName + "[0]"));
            }
          } else {
            // Recurse into nested object
            fields.push({ 
              field: fieldName, 
              type: "object", 
              value: "{...}" 
            });
            fields = fields.concat(extractFields(value, fieldName));
          }
        } else {
          // Simple value
          fields.push({ 
            field: fieldName, 
            type: typeof value, 
            value: value === null ? "null" : String(value) 
          });
        }
      }
    }
    
    return fields;
  };

  // Extract fields from both data sources
  const rapidDataFields = match.rapid_data ? extractFields(match.rapid_data, "rapid_data") : [];
  const betsapiDataFields = match.betsapi_data ? extractFields(match.betsapi_data, "betsapi_data") : [];
  const allFields = [...rapidDataFields, ...betsapiDataFields];
  const totalFieldCount = allFields.length;

  // Group fields by top-level category
  const groupedFields = allFields.reduce((acc, field) => {
    const category = field.field.split('.')[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(field);
    return acc;
  }, {});

  // Render the Fields tab content
  const renderFieldsTab = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Total Fields: {totalFieldCount}
      </Typography>
      {Object.entries(groupedFields).map(([category, fields]) => (
        <Accordion key={category} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              {category} ({fields.length} fields)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Field</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Value</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{field.field}</TableCell>
                      <TableCell>{field.type}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {field.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  // Helper function to extract markets and odds
  const extractMarketsAndOdds = () => {
    const markets = [];
    
    // Get player names from either team1/team2 or home/away pattern
    const team1Player = match.rapid_data?.raw_event_data?.team1;
    const team2Player = match.rapid_data?.raw_event_data?.team2;
    const homeName = match.betsapi_data?.inplay_event?.home?.name;  
    const awayName = match.betsapi_data?.inplay_event?.away?.name;
    
    // Use team1/2 names if available, otherwise fallback to home/away
    const homePlayer = team1Player || homeName || 'Player 1';
    const awayPlayer = team2Player || awayName || 'Player 2';

    // Log player names for debugging
    console.log('Players:', { team1Player, team2Player, homeName, awayName, homePlayer, awayPlayer });
    
    // Extract from BetsAPI data
    if (match.betsapi_data?.raw_prematch_data) {
      match.betsapi_data.raw_prematch_data.forEach(data => {
        if (data.main?.sp) {
          Object.entries(data.main.sp).forEach(([marketKey, market]) => {
            if (market.name && market.odds && Array.isArray(market.odds)) {
              // Special handling for TO WIN MATCH market
              if (market.name === 'TO WIN MATCH') {
                // Map the odds using player names instead of 1/2
                const oddsWithNames = market.odds.map(odd => {
                  // Convert string numbers to actual numbers for comparison
                  const oddNum = Number(odd.name);
                  return {
                    // BetsAPI uses '1' for home/team1 player and '2' for away/team2 player
                    name: oddNum === 1 ? homePlayer : oddNum === 2 ? awayPlayer : odd.name,
                    value: odd.odds
                  };
                });
                
                markets.push({
                  source: 'BetsAPI',
                  marketName: market.name,
                  odds: oddsWithNames
                });
              } else {
                // Handle other markets as before
                markets.push({
                  source: 'BetsAPI',
                  marketName: market.name,
                  odds: market.odds.map(odd => ({
                    name: odd.name,
                    value: odd.odds
                  }))
                });
              }
            }
          });
        }
      });
    }

    // Extract from Rapid data
    if (match.rapid_data?.raw_odds_data?.markets) {
      const rapidMarkets = match.rapid_data.raw_odds_data.markets;
      if (Array.isArray(rapidMarkets)) {
        markets.push({
          source: 'RapidAPI',
          marketName: 'Markets',
          odds: rapidMarkets.map((market, index) => ({
            name: index === 0 ? homePlayer : awayPlayer,
            value: market.coef
          }))
        });
      }
    }

    return markets;
  };

  // Render the Markets tab content
  const renderMarketsTab = () => {
    const markets = extractMarketsAndOdds();
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Available Markets ({markets.length})
        </Typography>
        {markets.map((market, index) => (
          <Accordion key={index} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {market.source} - {market.marketName}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Outcome Name</strong></TableCell>
                      <TableCell><strong>Odds</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {market.odds.map((odd, oddIndex) => (
                      <TableRow key={oddIndex}>
                        <TableCell>{odd.name}</TableCell>
                        <TableCell>{formatOdds(odd.value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  // Render the Raw JSON tab content
  const renderRawJsonTab = () => (
    <Box>
      {match.rapid_data && renderJsonData(match.rapid_data, 'RapidAPI Data')}
      {match.betsapi_data && renderJsonData(match.betsapi_data, 'BetsAPI Data')}
    </Box>
  );

  // Add new render functions for BetsAPI and RapidAPI tabs
  const renderBetsAPITab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>BetsAPI Raw Data</Typography>
      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <pre style={{ overflow: 'auto', maxWidth: '100%' }}>
          {JSON.stringify(match.betsapi_data, null, 2)}
        </pre>
      </Paper>
    </Box>
  );

  const renderRapidAPITab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>RapidAPI Raw Data</Typography>
      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <pre style={{ overflow: 'auto', maxWidth: '100%' }}>
          {JSON.stringify(match.rapid_data, null, 2)}
        </pre>
      </Paper>
    </Box>
  );

  // Add new render functions for BetsAPI and RapidAPI tree views
  const renderBetsAPITreeTab = () => (
    <Box sx={{ mt: 3 }}>
      <Paper 
        elevation={3}
        sx={{ 
          p: 2, 
          bgcolor: '#fff',
          maxHeight: '700px', 
          overflow: 'auto',
        }}
      >
        <List dense>
          {match.betsapi_data && (
            <JsonTreeNode 
              data={match.betsapi_data} 
              name="BetsAPI Data" 
              path="betsapi"
            />
          )}
        </List>
      </Paper>
    </Box>
  );

  const renderRapidAPITreeTab = () => (
    <Box sx={{ mt: 3 }}>
      <Paper 
        elevation={3}
        sx={{ 
          p: 2, 
          bgcolor: '#fff',
          maxHeight: '700px', 
          overflow: 'auto',
        }}
      >
        <List dense>
          {match.rapid_data && (
            <JsonTreeNode 
              data={match.rapid_data} 
              name="RapidAPI Data" 
              path="rapid"
            />
          )}
        </List>
      </Paper>
    </Box>
  );

  // Add new function to extract and format BetsAPI markets tree with better organization
  const extractBetsAPIMarketsTree = () => {
    if (!match.betsapi_data?.raw_prematch_data) {
      return null;
    }

    // Get player names with more detailed extraction
    const homeName = match.betsapi_data?.inplay_event?.home?.name || 
                    match.betsapi_data?.home?.name ||
                    'Unknown Home Player';
    const awayName = match.betsapi_data?.inplay_event?.away?.name ||
                    match.betsapi_data?.away?.name ||
                    'Unknown Away Player';

    const marketsTree = {
      name: "Match Markets",
      categories: {
        "Main Markets": [],
        "Game Markets": [],
        "Set Markets": [],
        "Other Markets": []
      }
    };

    match.betsapi_data.raw_prematch_data.forEach(data => {
      if (data.main?.sp) {
        Object.entries(data.main.sp).forEach(([marketKey, market]) => {
          if (market.name && market.odds && Array.isArray(market.odds)) {
            const marketData = {
              name: market.name,
              odds: market.odds.map(odd => {
                let selectionName = odd.name;
                if (selectionName === '1' || selectionName === 1) {
                  selectionName = homeName;
                } else if (selectionName === '2' || selectionName === 2) {
                  selectionName = awayName;
                }
                
                return {
                  name: selectionName,
                  value: odd.odds,
                  formatted: formatOdds(odd.odds, 'american'), // Only use American odds format
                  probability: ((1 / odd.odds) * 100).toFixed(1) + '%'
                };
              }),
              timestamp: data.updated || new Date().toISOString()
            };

            // Categorize markets
            if (market.name.includes('TO WIN MATCH') || market.name.includes('MATCH WINNER')) {
              marketsTree.categories["Main Markets"].push(marketData);
            } else if (market.name.includes('GAME')) {
              marketsTree.categories["Game Markets"].push(marketData);
            } else if (market.name.includes('SET')) {
              marketsTree.categories["Set Markets"].push(marketData);
            } else {
              marketsTree.categories["Other Markets"].push(marketData);
            }
          }
        });
      }
    });

    // Remove empty categories
    Object.keys(marketsTree.categories).forEach(key => {
      if (marketsTree.categories[key].length === 0) {
        delete marketsTree.categories[key];
      }
    });

    return marketsTree;
  };

  const renderBetsAPIMarketsTreeTab = () => {
    const marketsTree = extractBetsAPIMarketsTree();
    
    if (!marketsTree) {
      return (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No markets data available for this match
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 3 }}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 3,
            bgcolor: '#fff',
            maxHeight: '800px',
            overflow: 'auto',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ 
            mb: 3, 
            color: '#1a237e',
            fontWeight: 600,
            borderBottom: '2px solid #1a237e',
            pb: 1
          }}>
            Available Markets
          </Typography>

          {Object.entries(marketsTree.categories).map(([category, markets]) => (
            <Box key={category} sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2,
                  color: '#283593',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {category} ({markets.length})
              </Typography>

              {markets.map((market, index) => (
                <Accordion 
                  key={index}
                  sx={{
                    mb: 1,
                    '&:before': { display: 'none' },
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    '&.Mui-expanded': {
                      margin: '0 0 8px 0',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: 'rgba(63, 81, 181, 0.03)',
                      '&:hover': {
                        backgroundColor: 'rgba(63, 81, 181, 0.05)'
                      }
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, color: '#424242' }}>
                      {market.name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Selection</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#424242' }}>American Odds</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#424242' }}>Probability</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {market.odds.map((odd, oddIndex) => (
                            <TableRow 
                              key={oddIndex}
                              sx={{
                                '&:last-child td, &:last-child th': { border: 0 },
                                '&:hover': {
                                  backgroundColor: 'rgba(63, 81, 181, 0.02)'
                                }
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {odd.name}
                              </TableCell>
                              <TableCell 
                                align="right"
                                sx={{ 
                                  color: '#1a237e',
                                  fontWeight: 500,
                                  fontFamily: 'monospace'
                                }}
                              >
                                {odd.formatted}
                              </TableCell>
                              <TableCell 
                                align="right"
                                sx={{ 
                                  color: '#5c6bc0',
                                  fontWeight: 500
                                }}
                              >
                                {odd.probability}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        mt: 1,
                        textAlign: 'right',
                        color: '#9e9e9e'
                      }}
                    >
                      Last updated: {new Date(market.timestamp).toLocaleString()}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Paper>
      </Box>
    );
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ my: 3 }}>
        Match Details
      </Typography>
      
      <Typography variant="h5" gutterBottom>
        {match.rapid_data?.raw_event_data?.team1 || match.betsapi_data?.inplay_event?.home?.name} vs{' '}
        {match.rapid_data?.raw_event_data?.team2 || match.betsapi_data?.inplay_event?.away?.name}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ width: '100%', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Raw JSON" />
          <Tab label={`Fields (${totalFieldCount})`} />
          <Tab label="JSON Tree" />
          <Tab label="Markets" />
          <Tab label="BetsAPI Markets Tree" />
          <Tab label="BetsAPI Data" />
          <Tab label="RapidAPI Data" />
          <Tab label="BetsAPI Tree" />
          <Tab label="RapidAPI Tree" />
        </Tabs>
      </Box>
      
      {activeTab === 0 && renderRawJsonTab()}
      {activeTab === 1 && renderFieldsTab()}
      {activeTab === 2 && jsonTreeContent}
      {activeTab === 3 && renderMarketsTab()}
      {activeTab === 4 && renderBetsAPIMarketsTreeTab()}
      {activeTab === 5 && renderBetsAPITab()}
      {activeTab === 6 && renderRapidAPITab()}
      {activeTab === 7 && renderBetsAPITreeTab()}
      {activeTab === 8 && renderRapidAPITreeTab()}
    </Container>
  );
};

export default MatchDetail;