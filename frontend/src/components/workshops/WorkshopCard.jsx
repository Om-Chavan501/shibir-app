import { Card, CardContent, CardMedia, Typography, Box, Chip, Button, CardActions } from '@mui/material';
import { CalendarToday, LocationOn, School } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const WorkshopCard = ({ workshop }) => {
  const { 
    title, 
    image_url, 
    short_description, 
    start_date, 
    location, 
    eligible_grades,
    status
  } = workshop;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
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

  const getGradesText = (grades) => {
    if (grades && grades.length) {
      return `Grades ${grades.join(', ')}`;
    }
    return 'All grades';
  };

  return (
    <Card 
      component={RouterLink} 
      to={`/workshops/${workshop._id}`}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        textDecoration: 'none', // Remove underline from link
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 5
        }
      }}
    >
      <CardMedia
        component="img"
        height="180"
        image={image_url || 'https://source.unsplash.com/random/?science,workshop'}
        alt={title}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip 
            label={status.charAt(0).toUpperCase() + status.slice(1)} 
            size="small" 
            color={getStatusColor(status)}
            onClick={(e) => e.preventDefault()} // Prevent link navigation when clicking on chip
          />
        </Box>
        
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {short_description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2">{formatDate(start_date)}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2">{location}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <School fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2">{getGradesText(eligible_grades)}</Typography>
        </Box>
      </CardContent>
      
      {/* Optional: Keep the button for visual cue that it's clickable */}
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Button
          size="small"
          variant="outlined"
          // to={`/workshops/${workshop._id}`}
          color="primary"
          // onClick={(e) => e.preventDefault()} // Prevent double navigation
        >
          Learn More
        </Button>
      </CardActions>
    </Card>
  );
};

export default WorkshopCard;