import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getWorkshops, deleteWorkshop } from '../../services/api';
import { useSnackbar } from '../../contexts/SnackbarContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const AdminWorkshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const { showMessage } = useSnackbar();

  useEffect(() => {
    loadWorkshops();
  }, []);
  
  const loadWorkshops = async () => {
    try {
      setLoading(true);
      const data = await getWorkshops();
      setWorkshops(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading workshops:', err);
      setError('Failed to load workshops. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleDeleteDialogOpen = (workshop) => {
    setSelectedWorkshop(workshop);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedWorkshop(null);
  };
  
  const handleDeleteWorkshop = async () => {
    if (!selectedWorkshop) return;
    
    try {
      await deleteWorkshop(selectedWorkshop._id);
      showMessage('Workshop deleted successfully!', 'success');
      
      // Remove the deleted workshop from the list
      setWorkshops(workshops.filter(w => w._id !== selectedWorkshop._id));
    } catch (err) {
      console.error('Error deleting workshop:', err);
      showMessage('Failed to delete workshop. Please try again.', 'error');
    } finally {
      handleDeleteDialogClose();
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'primary';
      case 'ongoing':
        return 'success';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const filteredWorkshops = workshops
    .filter(workshop => 
      workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(workshop => 
      filterStatus ? workshop.status === filterStatus : true
    );

  if (loading) {
    return <LoadingSpinner message="Loading workshops..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Manage Workshops
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/admin/workshops/new"
        >
          Add Workshop
        </Button>
      </Box>
      
      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search Workshops"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon />
                </InputAdornment>
              }
            >
              <MenuItem key="all" value="">All Status</MenuItem>
              <MenuItem key="upcoming" value="upcoming">Upcoming</MenuItem>
              <MenuItem key="ongoing" value="ongoing">Ongoing</MenuItem>
              <MenuItem key="completed" value="completed">Completed</MenuItem>
              <MenuItem key="cancelled" value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>
      
      {/* Workshops Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="workshops table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Registrations</TableCell>
              <TableCell align="center">Fee (₹)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWorkshops.length > 0 ? (
              filteredWorkshops.map((workshop) => (
                <TableRow key={workshop._id}>
                  <TableCell component="th" scope="row">
                    {workshop.title}
                  </TableCell>
                  <TableCell>{formatDate(workshop.start_date)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={workshop.status.charAt(0).toUpperCase() + workshop.status.slice(1)} 
                      color={getStatusColor(workshop.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    {workshop.registered_count}/{workshop.max_participants}
                  </TableCell>
                  <TableCell align="center">{workshop.fee}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      component={RouterLink} 
                      to={`/admin/workshops/edit/${workshop._id}`}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={() => handleDeleteDialogOpen(workshop)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No workshops found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Workshop
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the workshop "{selectedWorkshop?.title}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteWorkshop} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminWorkshops;