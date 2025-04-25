import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  AccessTime,
  School,
  AttachMoney,
  Person,
  Check
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getWorkshopById } from '../services/api';

const WorkshopDetail = () => {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadWorkshop = async () => {
      try {
        setLoading(true);
        const data = await getWorkshopById(id);
        setWorkshop(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading workshop:', err);
        setError('Failed to load workshop details. Please try again later.');
        setLoading(false);
      }
    };
    
    loadWorkshop();
  }, [id]);
  
  const handleRegisterClick = () => {
    navigate(`/registration/${workshop._id}`);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
  
  const isRegistrationOpen = () => {
    if (!workshop) return false;
    
    // Check if workshop is upcoming or ongoing
    if (workshop.status !== 'upcoming' && workshop.status !== 'ongoing') {
      return false;
    }
    
    // Check if registration deadline has passed
    const deadlineDate = new Date(workshop.registration_deadline);
    const now = new Date();
    if (deadlineDate < now) {
      return false;
    }
    
    // Check if workshop is full
    if (workshop.registered_count >= workshop.max_participants) {
      return false;
    }
    
    return true;
  };

  if (loading) {
    return <LoadingSpinner message="Loading workshop details..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <ErrorMessage message={error} />
      </Container>
    );
  }
  
  if (!workshop) {
    return (
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <ErrorMessage message="Workshop not found." />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Workshop Image and Basic Info */}
        <Grid item xs={12} md={8}>
          <Box sx={{ position: 'relative' }}>
            <Box 
              component="img" 
              src={workshop.image_url || 'https://source.unsplash.com/random/?science,workshop'} 
              alt={workshop.title} 
              sx={{ 
                width: '100%', 
                borderRadius: 2,
                maxHeight: 400,
                objectFit: 'cover'
              }}
            />
            <Chip 
              label={workshop.status.charAt(0).toUpperCase() + workshop.status.slice(1)}
              color={getStatusColor(workshop.status)}
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16,
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            />
          </Box>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              {workshop.title}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {workshop.short_description}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h5" gutterBottom>
              About This Workshop
            </Typography>
            
            <Typography variant="body1" paragraph>
              {workshop.description}
            </Typography>
          </Box>
        </Grid>
        
        {/* Registration Card */}
        <Grid item xs={12} md={4}>
          <Card raised sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Workshop Details
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Date" 
                    secondary={`${formatDate(workshop.start_date)} to ${formatDate(workshop.end_date)}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AccessTime color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Time" 
                    secondary={`${formatTime(workshop.start_date)} - ${formatTime(workshop.end_date)}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <LocationOn color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Location" 
                    secondary={workshop.location}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <School color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Eligible Grades" 
                    secondary={workshop.eligible_grades.join(', ')}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Registration Fee" 
                    secondary={`₹${workshop.fee.toFixed(2)}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Capacity" 
                    secondary={`${workshop.registered_count} / ${workshop.max_participants} participants`}
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Registration Deadline
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {formatDate(workshop.registration_deadline)}
              </Typography>
              
              {isRegistrationOpen() ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={handleRegisterClick}
                  sx={{ mt: 2 }}
                >
                  Register Now
                </Button>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Registration is currently closed for this workshop.
                </Alert>
              )}
              
              {isRegistrationOpen() && isAuthenticated && (
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  You are logged in. Your information will be auto-filled in the registration form.
                </Typography>
              )}
            </CardContent>
          </Card>
          
          {/* Additional Information Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Important Information
              </Typography>
              <Typography variant="body2" paragraph>
                • Please arrive 15 minutes before the workshop starts
              </Typography>
              <Typography variant="body2" paragraph>
                • All materials will be provided
              </Typography>
              <Typography variant="body2" paragraph>
                • Students should bring their school ID card
              </Typography>
              <Typography variant="body2">
                • Parents are welcome to observe the workshop
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WorkshopDetail;