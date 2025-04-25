import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container,
  Link,
  CircularProgress,
  Alert
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useSnackbar } from '../contexts/SnackbarContext';

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);
  const { showMessage } = useSnackbar();
  
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required')
  });
  
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      await axios.post('/api/auth/forgot-password', values);
      setEmailSent(true);
      showMessage('If your email is registered, you will receive a password reset OTP', 'success');
    } catch (error) {
      console.error('Error requesting password reset:', error);
      let message = 'Failed to send password reset request. Please try again.';
      if (error.response && error.response.data && error.response.data.detail) {
        message = error.response.data.detail;
      }
      showMessage(message, 'error');
      setErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Forgot Password
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Enter your email to receive a password reset OTP
          </Typography>
        </Box>
        
        {emailSent ? (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              If your email is registered, you will receive a password reset OTP shortly.
            </Alert>
            <Typography variant="body2" gutterBottom>
              Please check your email for the OTP to reset your password.
            </Typography>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                component={RouterLink}
                to="/reset-password"
                variant="contained"
                color="primary"
                fullWidth
              >
                Enter OTP
              </Button>
            </Box>
          </Box>
        ) : (
          <Formik
            initialValues={{
              email: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  variant="outlined"
                  margin="normal"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
                
                {errors.submit && (
                  <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                    {errors.submit}
                  </Typography>
                )}
                
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Request Password Reset'}
                </Button>
              </Form>
            )}
          </Formik>
        )}
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Remembered your password?{' '}
            <Link component={RouterLink} to="/login">
              Back to Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;