import { Alert, Box, Button } from '@mui/material';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <Box sx={{ my: 4 }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        {message || 'Something went wrong. Please try again later.'}
      </Alert>
      {onRetry && (
        <Button variant="outlined" color="primary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorMessage;