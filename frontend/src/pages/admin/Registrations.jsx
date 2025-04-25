import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { getAllRegistrations, updateRegistration, exportRegistrations } from '../../services/api';
import { useSnackbar } from '../../contexts/SnackbarContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');
  const [filterWorkshop, setFilterWorkshop] = useState('');
  const { showMessage } = useSnackbar();
  
  // Get unique workshops for filtering
  const workshops = [...new Set(registrations.map(reg => reg.workshop_title))];

  useEffect(() => {
    loadRegistrations();
  }, []);
  
  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await getAllRegistrations();
      setRegistrations(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading registrations:', err);
      setError('Failed to load registrations. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleActionClick = (registration, action) => {
    setSelectedRegistration(registration);
    setActionType(action);
    setNotes('');
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRegistration(null);
    setActionType('');
  };
  
  const handleUpdateRegistration = async () => {
    if (!selectedRegistration) return;
    
    try {
      const updateData = {
        registration_status: actionType
      };
      
      if (notes.trim()) {
        updateData.notes = notes.trim();
      }
      
      await updateRegistration(selectedRegistration.id, updateData);
      
      // Update the local state
      const updatedRegistrations = registrations.map(reg => 
        reg.id === selectedRegistration.id 
          ? { ...reg, registration_status: actionType, notes: notes.trim() || reg.notes }
          : reg
      );
      
      setRegistrations(updatedRegistrations);
      showMessage(`Registration ${actionType === 'approved' ? 'approved' : 'rejected'} successfully!`, 'success');
      handleCloseDialog();
    } catch (err) {
      console.error('Error updating registration:', err);
      showMessage('Failed to update registration. Please try again.', 'error');
    }
  };
  
  const handleExport = async (workshopId, workshopTitle) => {
    try {
      const data = await exportRegistrations(workshopId);
      
      // Create CSV file and download
      const blob = new Blob([data.content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showMessage(`Exported registrations for ${workshopTitle}`, 'success');
    } catch (err) {
      console.error('Error exporting registrations:', err);
      showMessage('Failed to export registrations. Please try again.', 'error');
    }
  };
  
  const filteredRegistrations = filterWorkshop 
    ? registrations.filter(reg => reg.workshop_title === filterWorkshop) 
    : registrations;
    
  // Filter based on tab selection
  const tabFilteredRegistrations = tabValue === 0
    ? filteredRegistrations
    : tabValue === 1
      ? filteredRegistrations.filter(reg => reg.registration_status === 'pending')
      : tabValue === 2
        ? filteredRegistrations.filter(reg => reg.registration_status === 'approved')
        : filteredRegistrations.filter(reg => reg.registration_status === 'rejected');
    
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading registrations..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom>
        Manage Registrations
      </Typography>
      
      {/* Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="workshop-filter-label">Filter by Workshop</InputLabel>
                <Select
                  labelId="workshop-filter-label"
                  value={filterWorkshop}
                  onChange={(e) => setFilterWorkshop(e.target.value)}
                  label="Filter by Workshop"
                  startIcon={<FilterIcon />}
                >
                  <MenuItem value="">All Workshops</MenuItem>
                  {workshops.map((workshop) => (
                    <MenuItem key={workshop} value={workshop}>
                      {workshop}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="textSecondary">
                Total Registrations: {registrations.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Registrations" />
          <Tab label={`Pending (${registrations.filter(r => r.registration_status === 'pending').length})`} />
          <Tab label={`Approved (${registrations.filter(r => r.registration_status === 'approved').length})`} />
          <Tab label={`Rejected (${registrations.filter(r => r.registration_status === 'rejected').length})`} />
        </Tabs>
      </Box>
      
      {/* Registrations Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="registrations table">
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Workshop</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tabFilteredRegistrations.length > 0 ? (
              tabFilteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell component="th" scope="row">
                    {registration.full_name}
                  </TableCell>
                  <TableCell>{registration.email}</TableCell>
                  <TableCell>{registration.workshop_title || 'Unknown Workshop'}</TableCell>
                  <TableCell>{formatDate(registration.created_at)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={registration.registration_status.toUpperCase()}
                      color={getStatusColor(registration.registration_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={registration.payment_status.toUpperCase()}
                      color={registration.payment_status === 'completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small"
                      color="primary"
                      onClick={() => handleActionClick(registration, 'view')}
                    >
                      <ViewIcon />
                    </IconButton>
                    
                    {registration.registration_status === 'pending' && (
                      <>
                        <IconButton 
                          size="small"
                          color="success"
                          onClick={() => handleActionClick(registration, 'approved')}
                        >
                          <ApproveIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={() => handleActionClick(registration, 'rejected')}
                        >
                          <RejectIcon />
                        </IconButton>
                      </>
                    )}
                    
                    <IconButton 
                      size="small"
                      color="primary"
                      onClick={() => handleExport(registration.workshop_id, registration.workshop_title)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No registrations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {actionType === 'view' ? 'Registration Details' : 
           actionType === 'approved' ? 'Approve Registration' : 
           actionType === 'rejected' ? 'Reject Registration' : 'Registration'}
        </DialogTitle>
        <DialogContent>
          {actionType === 'view' ? (
            selectedRegistration && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Student Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Name:</strong> {selectedRegistration.full_name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Email:</strong> {selectedRegistration.email}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Phone:</strong> {selectedRegistration.phone}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Grade:</strong> {selectedRegistration.grade}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>School:</strong> {selectedRegistration.school}
                </Typography>
                
                <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
                  Parent/Guardian Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Name:</strong> {selectedRegistration.parent_name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Phone:</strong> {selectedRegistration.parent_phone}
                </Typography>
                
                <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
                  Registration Status
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Status:</strong> {selectedRegistration.registration_status}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Payment Status:</strong> {selectedRegistration.payment_status}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Registration Date:</strong> {formatDate(selectedRegistration.created_at)}
                </Typography>
                
                {selectedRegistration.notes && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedRegistration.notes}
                    </Typography>
                  </>
                )}
              </Box>
            )
          ) : (
            <>
              <DialogContentText>
                {actionType === 'approved' 
                  ? 'Are you sure you want to approve this registration?' 
                  : 'Are you sure you want to reject this registration?'}
              </DialogContentText>
              
              <TextField
                fullWidth
                margin="dense"
                id="notes"
                label="Notes (Optional)"
                type="text"
                multiline
                rows={3}
                variant="outlined"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {actionType === 'view' ? 'Close' : 'Cancel'}
          </Button>
          
          {actionType !== 'view' && (
            <Button 
              onClick={handleUpdateRegistration} 
              color={actionType === 'approved' ? 'success' : 'error'}
              variant="contained"
            >
              {actionType === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminRegistrations;