import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Avatar,
  Divider,
  Alert
} from '@mui/material';
import { PersonOutline as PersonIcon } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { updateProfile } from '../../services/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const { showMessage } = useSnackbar();
  const [isEditing, setIsEditing] = useState(false);
  
  const grades = [8, 9, 10];
  
  const validationSchema = Yup.object({
    full_name: Yup.string().required('Full name is required'),
    grade: Yup.number().required('Grade is required'),
    school: Yup.string().required('School name is required'),
    phone: Yup.string().required('Phone number is required'),
    parent_name: Yup.string().required('Parent/guardian name is required'),
    parent_phone: Yup.string().required('Parent/guardian phone is required')
  });
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const updatedUser = await updateProfile(values);
      showMessage('Profile updated successfully!', 'success');
      setUser({ ...user, ...updatedUser });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('Failed to update profile. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    full_name: user?.full_name || '',
    grade: user?.grade || '',
    school: user?.school || '',
    phone: user?.phone || '',
    parent_name: user?.parent_name || '',
    parent_phone: user?.parent_phone || ''
  };
  
  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        My Profile
      </Typography>
      
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', mr: 2 }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5">{user?.full_name}</Typography>
            <Typography variant="body2" color="textSecondary">{user?.email}</Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
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
                    disabled={!isEditing}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth 
                    variant="outlined"
                    error={touched.grade && Boolean(errors.grade)}
                    disabled={!isEditing}
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                  />
                </Grid>
                
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {isEditing ? (
                      <>
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          onClick={() => setIsEditing(false)} 
                          sx={{ mr: 2 }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          variant="contained" 
                          color="primary" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
        
        {/* Account Information */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Email
              </Typography>
              <Typography variant="body1">{user?.email}</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Account Created
              </Typography>
              <Typography variant="body1">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                To change your email or password, please contact support.
              </Alert>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;