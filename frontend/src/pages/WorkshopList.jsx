import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Container, 
  Grid, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Chip,
  Stack,
  Button,
  InputAdornment
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import WorkshopCard from '../components/workshops/WorkshopCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { getWorkshops } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

const WorkshopList = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    grade: '',
    topic: ''
  });

  // For advanced filtering
  const [showFilters, setShowFilters] = useState(false);
  
  // To keep track of applied filters for display
  const [activeFilters, setActiveFilters] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get grades list
  const grades = [8, 9, 10];
  
  // Page size
  const limit = 9;

  // Parse query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    // Set filters from URL params
    const status = searchParams.get('status') || '';
    const grade = searchParams.get('grade') || '';
    const search = searchParams.get('search') || '';
    const currentPage = parseInt(searchParams.get('page')) || 1;
    
    setFilters({ status, grade: grade ? parseInt(grade) : '' });
    setSearchTerm(search);
    setPage(currentPage);
    
    // Set active filters for display
    const newActiveFilters = [];
    if (status) newActiveFilters.push({ type: 'status', value: status });
    if (grade) newActiveFilters.push({ type: 'grade', value: `Grade ${grade}` });
    setActiveFilters(newActiveFilters);
  }, [location.search]);

  // Load workshops based on filters
  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        setLoading(true);
        
        // Calculate skip for pagination
        const skip = (page - 1) * limit;
        
        // Build query parameters
        const params = { skip, limit };
        if (filters.status) params.status = filters.status;
        if (filters.grade) params.grade = filters.grade;
        if (searchTerm) params.search = searchTerm;
        
        // Get filtered workshops
        const data = await getWorkshops(params);
        setWorkshops(data);
        
        // Set total pages - in a real app, this would come from the API
        // For now, we'll set a fixed number or dynamically adjust
        setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading workshops:', err);
        setError('Failed to load workshops. Please try again later.');
        setLoading(false);
      }
    };
    
    loadWorkshops();
  }, [page, filters, searchTerm]);

  // Update URL with filters
  const updateFilters = (newFilters) => {
    const searchParams = new URLSearchParams();
    if (newFilters.status) searchParams.set('status', newFilters.status);
    if (newFilters.grade) searchParams.set('grade', newFilters.grade.toString());
    if (searchTerm) searchParams.set('search', searchTerm);
    // Reset to page 1 when filters change
    searchParams.set('page', '1');
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    });
  };

  const handlePageChange = (event, value) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', value.toString());
    
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    
    const searchParams = new URLSearchParams(location.search);
    if (searchTerm) {
      searchParams.set('search', searchTerm);
    } else {
      searchParams.delete('search');
    }
    
    // Reset to page 1 when search changes
    searchParams.set('page', '1');
    
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    });
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const newFilters = { ...filters, [name]: value };
    updateFilters(newFilters);
  };

  const clearFilter = (type) => {
    const newFilters = { ...filters, [type]: '' };
    updateFilters(newFilters);
  };

  const clearAllFilters = () => {
    navigate(location.pathname);
  };

  if (loading) {
    return <LoadingSpinner message="Loading workshops..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <ErrorMessage message={error} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Science Workshops
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" paragraph>
          Explore our range of engaging science workshops designed for students in grades 8-10. 
          These hands-on sessions are led by expert mentors and cover various scientific disciplines.
        </Typography>
      </Box>
      
      {/* Search and Filter Bar */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                label="Search Workshops"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button type="submit">
                        <Search />
                      </Button>
                    </InputAdornment>
                  )
                }}
              />
            </form>
          </Grid>
          
          {/* Filter Toggle */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)} 
                color="primary"
                variant={showFilters ? "contained" : "outlined"}
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {/* Advanced Filters */}
        {showFilters && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="upcoming">Upcoming</MenuItem>
                    <MenuItem value="ongoing">Ongoing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Grade</InputLabel>
                  <Select
                    name="grade"
                    value={filters.grade}
                    onChange={handleFilterChange}
                    label="Grade"
                  >
                    <MenuItem value="">All Grades</MenuItem>
                    {grades.map((grade) => (
                      <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" component="span" sx={{ mr: 1 }}>
              Active filters:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 1 }}>
              {activeFilters.map((filter, index) => (
                <Chip
                  key={index}
                  label={`${filter.type}: ${filter.value}`}
                  onDelete={() => clearFilter(filter.type)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
              <Chip
                label="Clear All"
                onClick={clearAllFilters}
                color="secondary"
                size="small"
              />
            </Stack>
          </Box>
        )}
      </Box>
      
      {/* Workshops Grid */}
      {workshops.length > 0 ? (
        <Grid container spacing={4}>
          {workshops.map((workshop) => (
            <Grid item key={workshop._id} xs={12} sm={6} md={4}>
              <WorkshopCard workshop={workshop} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          title="No Workshops Found"
          description="Try adjusting your search criteria or check back later for new workshops."
          actionText="Clear Filters"
          actionHandler={clearAllFilters}
        />
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default WorkshopList;