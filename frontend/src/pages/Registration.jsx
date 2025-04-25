import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Container, 
  Grid, 
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getWorkshopById, registerForWorkshop } from '../services/api';

const Registration = () => {
  const { workshopId } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadWorkshop = async () => {
      try {
        setLoading(true);
        const data = await getWorkshopById(workshopId);
        setWorkshop(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading workshop:', err);
        setError('Failed to load workshop details. Please try again later.');
        setLoading(false);
      }
    };
    
    loadWorkshop();
  }, [workshopId]);
  
  const steps = ['Student Information', 'Parent Information', 'Confirmation'];
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const validationSchema = Yup.object({
    full_name: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    grade: Yup.number().required('Grade is required').oneOf(workshop?.eligible_grades || [], 'Selected grade is not eligible for this workshop'),
    school: Yup.string().required('School name is required'),
    parent_name: Yup.string().required('Parent name is required'),
    parent_phone: Yup.string().required('Parent phone number is required')
  });
  
  const initialValues = {
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    grade: user?.grade || '',
    school: user?.school || '',
    parent_name: user?.parent_name || '',
    parent_phone: user?.parent_phone || '',
  };
  
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const registrationData = {
        ...values,
        workshop_id: workshopId,
        user_id: isAuthenticated ? user.id : undefined
      };
      console.log(registrationData)
      await registerForWorkshop(registrationData);
      
      showMessage('Registration submitted successfully!', 'success');
      navigate(isAuthenticated ? '/dashboard/registrations' : '/');
    } catch (err) {
      console.error('Error submitting registration:', err);
      
      let errorMessage = 'Failed to submit registration. Please try again.';
      if (err.response && err.response.data && err.response.data.detail) {
        errorMessage = err.response.data.detail;
      }
      
      showMessage(errorMessage, 'error');
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading && !workshop) {
    return <LoadingSpinner message="Loading workshop details..." />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <ErrorMessage message={error} />
      </Container>
    );
  }
  
  if (!workshop) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <ErrorMessage message="Workshop not found." />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Register for Workshop
        </Typography>
        
        <Typography variant="h6" align="center" color="primary.main" gutterBottom>
          {workshop.title}
        </Typography>
        
        <Box sx={{ width: '100%', my: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isValid }) => (
            <Form>
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Student Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="full_name"
                        name="full_name"
                        label="Full Name"
                        value={values.full_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.full_name && Boolean(errors.full_name)}
                        helperText={touched.full_name && errors.full_name}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="email"
                        name="email"
                        label="Email Address"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        disabled={isAuthenticated}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="phone"
                        name="phone"
                        label="Phone Number"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.phone && Boolean(errors.phone)}
                        helperText={touched.phone && errors.phone}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl 
                        fullWidth
                        error={touched.grade && Boolean(errors.grade)}
                      >
                        <InputLabel id="grade-label">Grade</InputLabel>
                        <Select
                          labelId="grade-label"
                          id="grade"
                          name="grade"
                          value={values.grade}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label="Grade"
                        >
                          {workshop.eligible_grades.map((grade) => (
                            <MenuItem key={grade} value={grade}>
                              Grade {grade}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.grade && errors.grade && (
                          <FormHelperText>{errors.grade}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="school"
                        name="school"
                        label="School Name"
                        value={values.school}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.school && Boolean(errors.school)}
                        helperText={touched.school && errors.school}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      disabled={
                        !values.full_name || 
                        !values.email || 
                        !values.phone || 
                        !values.grade || 
                        !values.school ||
                        (touched.full_name && Boolean(errors.full_name)) ||
                        (touched.email && Boolean(errors.email)) ||
                        (touched.phone && Boolean(errors.phone)) ||
                        (touched.grade && Boolean(errors.grade)) ||
                        (touched.school && Boolean(errors.school))
                      }
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}
              
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Parent/Guardian Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="parent_name"
                        name="parent_name"
                        label="Parent/Guardian Full Name"
                        value={values.parent_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.parent_name && Boolean(errors.parent_name)}
                        helperText={touched.parent_name && errors.parent_name}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="parent_phone"
                        name="parent_phone"
                        label="Parent/Guardian Phone Number"
                        value={values.parent_phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.parent_phone && Boolean(errors.parent_phone)}
                        helperText={touched.parent_phone && errors.parent_phone}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      disabled={
                        !values.parent_name || 
                        !values.parent_phone ||
                        (touched.parent_name && Boolean(errors.parent_name)) ||
                        (touched.parent_phone && Boolean(errors.parent_phone))
                      }
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}
              
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Registration Summary
                  </Typography>
                  
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Workshop Details
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Title:</strong> {workshop.title}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Date:</strong> {formatDate(workshop.start_date)}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Location:</strong> {workshop.location}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Fee:</strong> {formatCurrency(workshop.fee)}
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Student Information
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Name:</strong> {values.full_name}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Email:</strong> {values.email}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Phone:</strong> {values.phone}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Grade:</strong> {values.grade}
                      </Typography>
                      <Typography variant="body1">
                        <strong>School:</strong> {values.school}
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Parent/Guardian Information
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Name:</strong> {values.parent_name}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Phone:</strong> {values.parent_phone}
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    By submitting this registration, you confirm that all provided information is correct.
                    Payment details will be shared via email upon approval of registration.
                  </Alert>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={loading || !isValid}
                    >
                      {loading ? 'Submitting...' : 'Submit Registration'}
                    </Button>
                  </Box>
                </Box>
              )}
              
              {!isAuthenticated && (
                <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #eee' }}>
                  <Typography variant="body2" color="textSecondary" align="center">
                    Already have an account? 
                    <Button 
                      component="a" 
                      href="/login" 
                      color="primary" 
                      size="small"
                    >
                      Log in
                    </Button>
                    to track your registrations.
                  </Typography>
                </Box>
              )}
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default Registration;