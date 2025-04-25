import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Button,
  LinearProgress
} from '@mui/material';
import {
  PeopleOutline as PeopleIcon,
  EventNote as EventIcon,
  AssignmentTurnedIn as RegistrationIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { getDashboardStats } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setError('Failed to load dashboard statistics. Please try again later.');
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard statistics..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const registrationsChartData = {
    labels: stats.daily_registrations.map(item => item.date),
    datasets: [
      {
        label: 'Registrations',
        data: stats.daily_registrations.map(item => item.count),
        fill: true,
        backgroundColor: 'rgba(25, 118, 210, 0.2)',
        borderColor: 'rgba(25, 118, 210, 1)',
        tension: 0.4
      }
    ]
  };

  const registrationsChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Daily Registrations (Last 7 Days)'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {/* Key Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.total_users}</Typography>
            <Typography variant="body2" color="textSecondary">Total Users</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <EventIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.total_workshops}</Typography>
            <Typography variant="body2" color="textSecondary">Total Workshops</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <RegistrationIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.total_registrations}</Typography>
            <Typography variant="body2" color="textSecondary">Total Registrations</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <TrendingIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.upcoming_workshops}</Typography>
            <Typography variant="body2" color="textSecondary">Upcoming Workshops</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Pending Approvals */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Pending Approvals</Typography>
              <Button 
                color="primary" 
                component={RouterLink} 
                to="/admin/registrations"
                size="small"
              >
                View All
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ mr: 2 }}>
                {stats.pending_registrations}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                registrations awaiting approval
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={(stats.pending_registrations / Math.max(stats.total_registrations, 1)) * 100} 
              sx={{ mb: 2, height: 8, borderRadius: 4 }}
              color="warning"
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Quick Actions
            </Typography>
            
            <Button
              fullWidth
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/admin/registrations"
              sx={{ mb: 1 }}
            >
              Review Registrations
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              component={RouterLink}
              to="/admin/workshops/new"
            >
              Create Workshop
            </Button>
          </Paper>
        </Grid>
        
        {/* Right Column - Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Registration Activity
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={registrationsChartData} options={registrationsChartOptions} />
            </Box>
          </Paper>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Workshops
                  </Typography>
                  <List dense>
                    {/* Sample list items - in a real app, these would come from the API */}
                    <ListItem disableGutters>
                      <ListItemText 
                        primary="Physics Fun" 
                        secondary="Sep 15, 2023" 
                      />
                      <Button size="small" color="primary">View</Button>
                    </ListItem>
                    <Divider component="li" />
                    <ListItem disableGutters>
                      <ListItemText 
                        primary="Chemistry Experiments" 
                        secondary="Sep 22, 2023" 
                      />
                      <Button size="small" color="primary">View</Button>
                    </ListItem>
                    <Divider component="li" />
                    <ListItem disableGutters>
                      <ListItemText 
                        primary="Biology Workshop" 
                        secondary="Oct 5, 2023" 
                      />
                      <Button size="small" color="primary">View</Button>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activities
                  </Typography>
                  <List dense>
                    {/* Sample list items - in a real app, these would come from the API */}
                    <ListItem disableGutters>
                      <ListItemText 
                        primary="New registration" 
                        secondary="Rahul Sharma for Physics Fun" 
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem disableGutters>
                      <ListItemText 
                        primary="Workshop updated" 
                        secondary="Chemistry Experiments details changed" 
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem disableGutters>
                      <ListItemText 
                        primary="Payment received" 
                        secondary="₹500 from Priya Patel" 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;