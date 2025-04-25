import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { getMyRegistrations, cancelRegistration } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

const Registrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const { showMessage } = useSnackbar();

  useEffect(() => {
    loadRegistrations();
  }, []);
  
  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await getMyRegistrations();
      setRegistrations(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading registrations:', err);
      setError('Failed to load your registrations. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleCancelDialogOpen = (registration) => {
    setSelectedRegistration(registration);
    setCancelDialogOpen(true);
  };
  
  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setSelectedRegistration(null);
  };
  
  const handleCancelRegistration = async () => {
    if (!selectedRegistration) return;
    
    try {
      setLoading(true);
      await cancelRegistration(selectedRegistration.id);
      showMessage('Registration cancelled successfully!', 'success');
      
      // Reload registrations
      await loadRegistrations();
    } catch (err) {
      console.error('Error cancelling registration:', err);
      showMessage('Failed to cancel registration. Please try again.', 'error');
      setLoading(false);
    } finally {
      handleCancelDialogClose();
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      default:
        return null;
    }
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
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner message="Loading your registrations..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        My Workshop Registrations
      </Typography>
      
      {registrations.length > 0 ? (
        <Grid container spacing={3}>
          {registrations.map((registration) => (
            <Grid item xs={12} key={registration.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getStatusIcon(registration.registration_status)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {registration.workshop_title || 'Workshop Registration'}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Chip 
                      label={registration.registration_status.toUpperCase()} 
                      color={getStatusColor(registration.registration_status)} 
                      size="small" 
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Registration Date</TableCell>
                          <TableCell>{formatDate(registration.created_at)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Payment Status</TableCell>
                          <TableCell>
                            <Chip 
                              label={registration.payment_status.toUpperCase()} 
                              color={registration.payment_status === 'completed' ? 'success' : 'warning'} 
                              size="small" 
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Amount Paid</TableCell>
                          <TableCell>₹{registration.amount_paid || '0.00'}</TableCell>
                        </TableRow>
                        {registration.notes && (
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                            <TableCell>{registration.notes}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
                <CardActions>
                  {registration.registration_status === 'pending' && (
                    <Button 
                      size="small" 
                      color="error"
                      onClick={() => handleCancelDialogOpen(registration)}
                    >
                      Cancel Registration
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          title="No Registrations Found"
          description="You haven't registered for any workshops yet."
          actionText="Browse Workshops"
          actionHandler={() => window.location.href = '/workshops'}
        />
      )}
      
      {/* Cancel Registration Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelDialogClose}
        aria-labelledby="cancel-dialog-title"
      >
        <DialogTitle id="cancel-dialog-title">
          Cancel Registration
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this registration? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="primary">
            No, Keep Registration
          </Button>
          <Button onClick={handleCancelRegistration} color="error">
            Yes, Cancel Registration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Registrations;   