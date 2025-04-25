import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({ 
  title = 'No Data Found', 
  description = 'There is nothing to display here.', 
  actionText, 
  actionHandler 
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 8,
        textAlign: 'center'
      }}
    >
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      {actionText && actionHandler && (
        <Button variant="contained" color="primary" onClick={actionHandler}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;