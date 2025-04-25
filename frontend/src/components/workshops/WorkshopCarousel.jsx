import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Container, useTheme } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { Link as RouterLink } from 'react-router-dom';

const WorkshopCarousel = ({ workshops = [], autoPlayInterval = 5000 }) => {
  const theme = useTheme();

  if (!workshops.length) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Carousel
        animation="slide"
        interval={autoPlayInterval}
        indicators={true}
        navButtonsAlwaysVisible={true}
        fullHeightHover={false}
        sx={{ borderRadius: 2 }}
      >
        {workshops.map((workshop, index) => (
          <Paper
            key={workshop._id}
            elevation={8}
            sx={{
              position: 'relative',
              backgroundColor: 'grey.800',
              color: 'white',
              borderRadius: 2,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${workshop.image_url})`,
              height: { xs: 300, sm: 400, md: 500 }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: { xs: 3, sm: 6, md: 8 },
                textAlign: 'center'
              }}
            >
              <Typography component="h2" variant="h3" gutterBottom>
                {workshop.title}
              </Typography>
              <Typography variant="h5" paragraph sx={{ maxWidth: '80%' }}>
                {workshop.short_description}
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large" 
                component={RouterLink} 
                to={`/workshops/${workshop._id}`}
                sx={{ mt: 2 }}
              >
                Learn More
              </Button> 
            </Box>
          </Paper>
        ))}
      </Carousel>
    </Container>
  );
};

export default WorkshopCarousel;