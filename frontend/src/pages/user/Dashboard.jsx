import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider
} from '@mui/material';
import { 
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getMyRegistrations, getWorkshops } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [upcomingWorkshops, setUpcomingWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load user's registrations
        const registrationsData = await getMyRegistrations();
        setRegistrations(registrationsData);
        
        // Load upcoming workshops
        const workshopsData = await getWorkshops({ 
          status: 'upcoming',
          limit: 3,
          grade: user?.grade // Filter by user's grade
        });
        setUpcomingWorkshops(workshopsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  const getRegistrationStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };
  
  const getRegistrationStatusColor = (status) => {
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
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Welcome, {user?.full_name}!
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Your Registrations
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            {registrations.length > 0 ? (
              <Grid container spacing={3}>
                {registrations.map((registration) => (
                  <Grid item xs={12} sm={6} md={4} key={registration.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {getRegistrationStatusIcon(registration.registration_status)}
                          <Typography variant="h6" sx={{ ml: 1 }}>
                            {registration.workshop_title || 'Workshop'}
                          </Typography>
                        </Box>
                        
                        <Chip 
                          label={registration.registration_status.toUpperCase()} 
                          color={getRegistrationStatusColor(registration.registration_status)} 
                          size="small" 
                          sx={{ mb: 2 }}
                        />
                        
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Payment Status: {registration.payment_status}
                        </Typography>
                        
                        <Typography variant="body2" color="textSecondary">
                          Registration Date: {new Date(registration.created_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary"
                          component={RouterLink}
                          to={`/dashboard/registrations`}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <EmptyState
                title="No Registrations Yet"
                description="You haven't registered for any workshops yet."
                actionText="Browse Workshops"
                actionHandler={() => window.location.href = '/workshops'}
              />
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Recommended Workshops
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            {upcomingWorkshops.length > 0 ? (
              <Grid container spacing={3}>
                {upcomingWorkshops.map((workshop) => (
                  <Grid item xs={12} sm={6} md={4} key={workshop._id}>
                    <Card>
                      <Box
                        component="img"
                        height="140"
                        image={workshop.image_url || `https://source.unsplash.com/random/?science,${workshop.title}`}
                        alt={workshop.title}
                        sx={{ width: '100%', objectFit: 'cover' }}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h6">
                          {workshop.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {workshop.short_description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <EventIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            {new Date(workshop.start_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary"
                          component={RouterLink}
                          to={`/workshops/${workshop._id}`}
                        >
                          Learn More
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          color="primary"
                          component={RouterLink}
                          to={`/registration/${workshop._id}`}
                        >
                          Register
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <EmptyState
                title="No Workshops Available"
                description="There are currently no upcoming workshops for your grade."
                actionText="Browse All Workshops"
                actionHandler={() => window.location.href = '/workshops'}
              />
            )}
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                color="primary"
                component={RouterLink}
                to="/workshops"
              >
                View All Workshops
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;