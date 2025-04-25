
import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Container, 
  Button, 
  Card, 
  CardContent,
  CardMedia,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Science, School, Psychology, EmojiEvents } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import WorkshopCarousel from '../components/workshops/WorkshopCarousel';
import WorkshopCard from '../components/workshops/WorkshopCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getWorkshops } from '../services/api';

const Home = () => {
  const [featuredWorkshops, setFeaturedWorkshops] = useState([]);
  const [upcomingWorkshops, setUpcomingWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        // Load featured workshops
        const featured = await getWorkshops({ featured: true, limit: 5 });
        setFeaturedWorkshops(featured);
        
        // Load upcoming workshops
        const upcoming = await getWorkshops({ status: 'upcoming', limit: 3 });
        setUpcomingWorkshops(upcoming);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading workshops:', err);
        setError('Failed to load workshops. Please try again later.');
        setLoading(false);
      }
    };
    
    loadWorkshops();
  }, []);

  // Sample testimonials (could be loaded from API in real app)
  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Student, Grade 10',
      content: 'The astronomy workshop completely changed how I look at the night sky. The hands-on activities with telescopes and star maps were incredible!',
      avatar: '/avatars/student1.jpg'
    },
    {
      id: 2,
      name: 'Anil Deshmukh',
      role: 'Parent',
      content: 'My daughter came home bubbling with excitement after the chemistry workshop. The experiments were safe yet fascinating, and she\'s now considering science as a career.',
      avatar: '/avatars/parent1.jpg'
    },
    {
      id: 3,
      name: 'Mrs. Joshi',
      role: 'Science Teacher, DPS School',
      content: 'The Vijnana Dals workshops complement our school curriculum perfectly. They bring science to life in ways that traditional classrooms cannot.',
      avatar: '/avatars/teacher1.jpg'
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Loading workshops..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'primary.dark',
          color: 'white',
          py: { xs: 4, md: 8 },
          px: { xs: 2, sm: 3 },
          borderRadius: { xs: 0, sm: 2 },
          mb: { xs: 3, md: 6 }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center" direction={isMobile ? "column-reverse" : "row"}>
            <Grid item xs={12} md={6}>
              <Typography variant={isMobile ? "h3" : "h2"} component="h1" gutterBottom>
                Discover the Wonder of Science
              </Typography>
              <Typography variant={isMobile ? "body1" : "h5"} paragraph>
                Join Jnana Prabodhini's Vijnana Dals for hands-on science workshops designed to spark curiosity and foster innovation.
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to="/workshops"
                  fullWidth={isMobile}
                  sx={{ mb: isMobile ? 2 : 0 }}
                >
                  Explore Workshops
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  fullWidth={isMobile}
                >
                  Join Us
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/science-hero.png"
                alt="Students doing science experiments"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: 8,
                  mb: isMobile ? 3 : 0
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Upcoming Workshops */}
      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'flex-start' : 'center', 
            mb: { xs: 3, md: 4 },
            gap: 2
          }}>
            <Typography variant="h4" component="h2">
              Upcoming Workshops
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              component={RouterLink} 
              to="/workshops"
              size={isMobile ? "medium" : "large"}
            >
              View All
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {upcomingWorkshops.length > 0 ? (
              upcomingWorkshops.map(workshop => (
                <Grid item key={workshop._id} xs={12} sm={6} md={4}>
                  <WorkshopCard workshop={workshop} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography align="center" color="textSecondary">
                  No upcoming workshops at the moment. Please check back soon!
                </Typography>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
      
      {/* Featured Workshops Carousel */}
      {featuredWorkshops.length > 0 && (
        <Box sx={{ py: { xs: 3, md: 4 } }}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h2" gutterBottom align="center">
              Featured Workshops
            </Typography>
            <WorkshopCarousel workshops={featuredWorkshops} />
          </Container>
        </Box>
      )}

      {/* Program Features */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: { xs: 2, md: 4 } }}>
            Why Join Our Workshops?
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ width: 60, height: 60, mx: 'auto', bgcolor: 'primary.main', mb: 2 }}>
                  <Science fontSize={isMobile ? "medium" : "large"} />
                </Avatar>
                <Typography variant="h6" gutterBottom>Hands-on Learning</Typography>
                <Typography variant="body2" color="text.secondary">
                  Experience science through practical experiments and interactive activities
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ width: 60, height: 60, mx: 'auto', bgcolor: 'secondary.main', mb: 2 }}>
                  <School fontSize={isMobile ? "medium" : "large"} />
                </Avatar>
                <Typography variant="h6" gutterBottom>Expert Mentors</Typography>
                <Typography variant="body2" color="text.secondary">
                  Learn from passionate scientists and educators with years of experience
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ width: 60, height: 60, mx: 'auto', bgcolor: 'success.main', mb: 2 }}>
                  <Psychology fontSize={isMobile ? "medium" : "large"} />
                </Avatar>
                <Typography variant="h6" gutterBottom>Critical Thinking</Typography>
                <Typography variant="body2" color="text.secondary">
                  Develop problem-solving skills through scientific inquiry and exploration
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ width: 60, height: 60, mx: 'auto', bgcolor: 'info.main', mb: 2 }}>
                  <EmojiEvents fontSize={isMobile ? "medium" : "large"} />
                </Avatar>
                <Typography variant="h6" gutterBottom>Recognition</Typography>
                <Typography variant="body2" color="text.secondary">
                  Earn certificates and showcase your scientific achievements
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      
      {/* Testimonials */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: { xs: 3, md: 4 } }}>
            What Our Participants Say
          </Typography>
          
          <Grid container spacing={3}>
            {testimonials.map(testimonial => (
              <Grid item key={testimonial.id} xs={12} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
                      "{testimonial.content}"
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        sx={{ mr: 2 }}
                      />
                      <Box>
                        <Typography variant="subtitle1" component="div">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Call to Action */}
      <Box 
        sx={{ 
          py: { xs: 5, md: 8 }, 
          px: { xs: 2, sm: 3 },
          backgroundColor: 'secondary.main',
          color: 'white',
          borderRadius: { xs: 0, sm: 2 },
          mt: { xs: 3, md: 6 }
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant={isMobile ? "h4" : "h3"} component="h2" gutterBottom>
            Ready to Begin Your Scientific Journey?
          </Typography>
          <Typography variant={isMobile ? "body1" : "h6"} sx={{ mb: 4 }}>
            Register now for our workshops and discover the wonders of science!
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={RouterLink}
              to="/workshops"
              fullWidth={isMobile}
            >
              Browse Workshops
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              component={RouterLink}
              to="/register"
              fullWidth={isMobile}
            >
              Create Account
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;