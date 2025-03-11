# Tennis Match Data Visualization Frontend
Last Updated: March 9, 2024

## Project Overview
This React-based frontend application provides a comprehensive visualization and analysis interface for tennis match data from multiple sources (RapidAPI and BetsAPI). The application processes and displays match information, odds data, and detailed statistics in an organized and user-friendly manner.

## Key Features

### Match Details View
The match details page implements a tabbed interface with four main sections:

1. **Raw JSON Tab**
   - Displays unprocessed data from both API sources
   - Separated sections for RapidAPI and BetsAPI data
   - Pretty-printed JSON format for better readability

2. **Fields Tab**
   - Dynamic field counting and categorization
   - Hierarchical display of all available data fields
   - Organized by data source (RapidAPI vs BetsAPI)
   - Shows field types, values, and nested structure
   - Total field count displayed in tab header

3. **JSON Tree Tab**
   - Interactive tree view of the complete data structure
   - Expandable/collapsible nodes for nested objects and arrays
   - Color-coded by data types
   - Special handling for odds values with automated formatting
   - Visual indicators for array lengths and object types

4. **Markets Tab**
   - Comprehensive display of betting markets
   - Smart categorization of market types
   - Special handling for "TO WIN MATCH" market:
     - Player name mapping (converts generic "1"/"2" to actual player names)
     - Integration of both RapidAPI and BetsAPI odds data
   - Accordion-style market groups for better organization
   - Standardized odds format display

### Data Processing Features

#### Player Name Handling
- Intelligent player name extraction from multiple sources:
  - RapidAPI: team1/team2 fields
  - BetsAPI: home/away name fields
- Fallback mechanism for missing names
- Consistent player name mapping across different market types

#### Odds Processing
- Automated odds format conversion
- Support for multiple odds formats:
  - Decimal
  - American
  - Fractional
- Special handling for handicap markets
- Consistent display format across different providers

#### Data Organization
1. Market Categorization:
   - Automatic grouping by market types
   - Special handling for specific markets (e.g., "TO WIN MATCH")
   - Structured display of odds and outcomes

2. Field Analysis:
   - Recursive field extraction
   - Type detection and categorization
   - Nested structure preservation
   - Array handling with sample item display

### UI/UX Features
- Material-UI based responsive design
- Interactive expandable/collapsible sections
- Consistent styling across all components
- Clear visual hierarchy
- Loading states and error handling
- Dynamic updates for real-time data

### Technical Implementation Details

#### Component Structure
- MatchDetail.js: Main component for detailed match view
- Implements tabbed interface using Material-UI Tabs
- Custom components for specialized data display:
  - JsonTreeNode: Recursive component for tree view
  - Market display components
  - Field analysis components

#### Data Processing Functions
1. extractMarketsAndOdds():
   - Processes both API data sources
   - Handles special cases for different market types
   - Maps player names consistently
   - Normalizes odds formats

2. extractFields():
   - Recursive field extraction
   - Handles nested objects and arrays
   - Provides type information
   - Maintains field hierarchy

3. formatOdds():
   - Standardizes odds display
   - Handles multiple formats
   - Special cases for specific markets

#### State Management
- React useState for local state
- Memoization with useMemo for performance
- Efficient rendering with React.memo
- Controlled expansion state for tree view

### Recent Updates and Improvements
- Added player name mapping for "TO WIN MATCH" market
- Implemented recursive JSON tree view with expandable nodes
- Enhanced field analysis with better type detection
- Improved odds formatting and display
- Added detailed market categorization
- Enhanced error handling and loading states

## Recent Updates

### Odds Display Enhancement (March 2024)
- Modified odds display to show only American odds format
- Removed decimal and fractional odds formats for cleaner presentation
- Updated oddsConverter.js to optimize odds conversion functionality
- Standardized odds display across all market types

### BetsAPI Markets Tree Improvements
- Enhanced player name mapping in market selections
- Fixed player name display in "TO WIN MATCH" markets
- Now correctly maps player numbers (1/2) to actual player names from:
  - Primary: match.betsapi_data.home.name / match.betsapi_data.away.name
  - Fallback: match.betsapi_data.inplay_event.home.name / match.betsapi_data.away.name

### Market Display Enhancements
- Improved market categorization:
  - Main Markets (including TO WIN MATCH)
  - Game Markets
  - Set Markets
  - Other Markets
- Added probability percentage calculation
- Cleaner and more intuitive market organization
- Enhanced timestamp display for market updates

### Technical Changes
- Updated odds conversion logic in oddsConverter.js
  - Simplified to only handle American odds format
  - Improved number formatting and sign handling
- Modified MatchDetail.js market extraction logic
  - Better player name mapping
  - Streamlined market categorization
  - Enhanced data structure for market display

## Setup and Installation

### Prerequisites
- Node.js
- npm or yarn

### Installation Steps
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### Dependencies
- @mui/material: UI components
- @mui/icons-material: Material icons
- react-router-dom: Routing
- Other utility libraries for data processing

## Future Enhancements
- Real-time data updates
- Additional market type support
- Enhanced statistics visualization
- More detailed player information
- Historical data comparison
- Advanced filtering options

## Contributing
Contributions are welcome! Please read our contributing guidelines and submit pull requests for any enhancements.

## License
This project is proprietary and confidential.
