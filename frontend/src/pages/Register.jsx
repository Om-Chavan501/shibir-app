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
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  
  const grades = [8, 9, 10];
  
  const validationSchema = Yup.object({
    full_name: Yup.string()
      .required('Full name is required'),
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password should be at least 8 characters')
      .required('Password is required'),
    grade: Yup.number()
      .required('Grade is required'),
    school: Yup.string()
      .required('School name is required'),
    phone: Yup.string()
      .required('Phone number is required'),
    parent_name: Yup.string()
      .required('Parent/guardian name is required'),
    parent_phone: Yup.string()
      .required('Parent/guardian phone is required')
  });
  
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      await register(values);
    } catch (error) {
      setErrors({ submit: 'Registration failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create an Account
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Join Jnana Prabodhini Vijnana Dals to register for workshops
          </Typography>
        </Box>
        
        <Formik
          initialValues={{
            full_name: '',
            email: '',
            password: '',
            grade: '',
            school: '',
            phone: '',
            parent_name: '',
            parent_phone: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                {/* Student Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Student Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="full_name"
                    name="full_name"
                    label="Full Name"
                    variant="outlined"
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
                    variant="outlined"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth 
                    variant="outlined"
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
                      {grades.map((grade) => (
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
                    variant="outlined"
                    value={values.school}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.school && Boolean(errors.school)}
                    helperText={touched.school && errors.school}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    variant="outlined"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />
                </Grid>
                
                {/* Parent Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Parent/Guardian Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="parent_name"
                    name="parent_name"
                    label="Parent/Guardian Name"
                    variant="outlined"
                    value={values.parent_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.parent_name && Boolean(errors.parent_name)}
                    helperText={touched.parent_name && errors.parent_name}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="parent_phone"
                    name="parent_phone"
                    label="Parent/Guardian Phone"
                    variant="outlined"
                    value={values.parent_phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.parent_phone && Boolean(errors.parent_phone)}
                    helperText={touched.parent_phone && errors.parent_phone}
                  />
                </Grid>
              </Grid>
              
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
                sx={{ mt: 4 }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Register'}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login">
                    Login
                  </Link>
                </Typography>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default Register;