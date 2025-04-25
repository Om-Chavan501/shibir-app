import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Chip,
  FormHelperText,
  InputAdornment,
  CircularProgress,
  Divider
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { getWorkshopById, createWorkshop, updateWorkshop } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const WorkshopForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  // Create a state to hold form values when an error occurs
  const [savedFormValues, setSavedFormValues] = useState(null);
  
  const isEditMode = !!id;
  
  // Use useCallback to prevent unnecessary re-renders
  const loadWorkshop = useCallback(async () => {
    if (!isEditMode) return;
    
    try {
      const data = await getWorkshopById(id);
      setWorkshop(data);
    } catch (err) {
      console.error('Error loading workshop:', err);
      setError('Failed to load workshop details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode]);
  
  useEffect(() => {
    loadWorkshop();
  }, [loadWorkshop]);
  
  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    short_description: Yup.string().required('Short description is required'),
    image_url: Yup.string().url('Must be a valid URL').required('Image URL is required'),
    start_date: Yup.date().required('Start date is required'),
    end_date: Yup.date()
      .required('End date is required')
      .min(
        Yup.ref('start_date'),
        'End date must be later than start date'
      ),
    registration_deadline: Yup.date()
      .required('Registration deadline is required')
      .max(
        Yup.ref('start_date'),
        'Registration deadline must be before start date'
      ),
    location: Yup.string().required('Location is required'),
    max_participants: Yup.number()
      .required('Maximum participants is required')
      .min(1, 'Must accept at least 1 participant'),
    fee: Yup.number()
      .required('Fee is required')
      .min(0, 'Fee cannot be negative'),
    eligible_grades: Yup.array()
      .of(Yup.number().required('Grade is required'))
      .min(1, 'At least one grade must be selected'),
    status: Yup.string().required('Status is required')
  });

  // Determine initial values based on the presence of saved form values or workshop data
  const getInitialValues = () => {
    if (savedFormValues) {
      return savedFormValues;
    }
    
    if (isEditMode && workshop) {
      return {
        title: workshop.title || '',
        description: workshop.description || '',
        short_description: workshop.short_description || '',
        image_url: workshop.image_url || '',
        start_date: workshop.start_date ? dayjs(workshop.start_date) : dayjs(),
        end_date: workshop.end_date ? dayjs(workshop.end_date) : dayjs().add(2, 'hour'),
        registration_deadline: workshop.registration_deadline ? 
          dayjs(workshop.registration_deadline) : dayjs(),
        location: workshop.location || '',
        max_participants: workshop.max_participants || 30,
        fee: workshop.fee || 500,
        eligible_grades: workshop.eligible_grades || [8, 9, 10],
        featured: workshop.featured || false,
        status: workshop.status || 'upcoming'
      };
    }
    
    return {
      title: '',
      description: '',
      short_description: '',
      image_url: '',
      start_date: dayjs(),
      end_date: dayjs().add(2, 'hour'),
      registration_deadline: dayjs(),
      location: '',
      max_participants: 30,
      fee: 500,
      eligible_grades: [8, 9, 10],
      featured: false,
      status: 'upcoming'
    };
  };

  const grades = [8, 9, 10];
  const statuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];

  const handleSubmit = async (values, { setSubmitting }) => {
    // Save form values in case of error
    setSavedFormValues(values);
    
    // Convert dayjs objects to ISO strings for backend compatibility
    const formattedValues = {
      ...values,
      start_date: values.start_date.toISOString(),
      end_date: values.end_date.toISOString(),
      registration_deadline: values.registration_deadline.toISOString()
    };
    
    try {
      if (isEditMode) {
        // Use the correct workshop ID from the loaded workshop
        const workshopId = workshop._id;
        if (!workshopId) {
          throw new Error("Workshop ID not found");
        }
        await updateWorkshop(workshopId, formattedValues);
        showMessage('Workshop updated successfully!', 'success');
        // Only clear saved form values on success
        setSavedFormValues(null);
        navigate('/admin/workshops');
      } else {
        await createWorkshop(formattedValues);
        showMessage('Workshop created successfully!', 'success');
        // Only clear saved form values on success
        setSavedFormValues(null);
        navigate('/admin/workshops');
      }
    } catch (err) {
      console.error('Error saving workshop:', err);
      
      let errorMessage = isEditMode 
        ? 'Failed to update workshop' 
        : 'Failed to create workshop';
        
      if (err.response && err.response.data && err.response.data.detail) {
        errorMessage = err.response.data.detail;
      }
      
      showMessage(errorMessage, 'error');
      // Don't clear the saved form values on error
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading workshop details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const initialValues = getInitialValues();

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Workshop' : 'Create Workshop'}
      </Typography>
      
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={false} // Disable automatic reinitialization
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="title"
                    name="title"
                    label="Workshop Title"
                    variant="outlined"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="short_description"
                    name="short_description"
                    label="Short Description"
                    variant="outlined"
                    value={values.short_description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.short_description && Boolean(errors.short_description)}
                    helperText={(touched.short_description && errors.short_description) || "Brief summary for cards and listings"}
                    inputProps={{ maxLength: 150 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Full Description"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="image_url"
                    name="image_url"
                    label="Image URL"
                    variant="outlined"
                    value={values.image_url}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.image_url && Boolean(errors.image_url)}
                    helperText={(touched.image_url && errors.image_url) || "URL to workshop banner image"}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Schedule & Location
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Start Date & Time"
                      value={values.start_date}
                      onChange={(newValue) => setFieldValue('start_date', newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          error: touched.start_date && Boolean(errors.start_date),
                          helperText: touched.start_date && errors.start_date
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="End Date & Time"
                      value={values.end_date}
                      onChange={(newValue) => setFieldValue('end_date', newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          error: touched.end_date && Boolean(errors.end_date),
                          helperText: touched.end_date && errors.end_date
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Registration Deadline"
                      value={values.registration_deadline}
                      onChange={(newValue) => setFieldValue('registration_deadline', newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          error: touched.registration_deadline && Boolean(errors.registration_deadline),
                          helperText: touched.registration_deadline && errors.registration_deadline
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="location"
                    name="location"
                    label="Location"
                    variant="outlined"
                    value={values.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.location && Boolean(errors.location)}
                    helperText={touched.location && errors.location}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Registration Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    id="max_participants"
                    name="max_participants"
                    label="Maximum Participants"
                    variant="outlined"
                    type="number"
                    value={values.max_participants}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.max_participants && Boolean(errors.max_participants)}
                    helperText={touched.max_participants && errors.max_participants}
                    InputProps={{
                      inputProps: { min: 1 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    id="fee"
                    name="fee"
                    label="Registration Fee"
                    variant="outlined"
                    type="number"
                    value={values.fee}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.fee && Boolean(errors.fee)}
                    helperText={touched.fee && errors.fee}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl 
                    fullWidth 
                    error={touched.status && Boolean(errors.status)}
                  >
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      name="status"
                      value={values.status}
                      label="Status"
                      onChange={handleChange}
                    >
                      {statuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.status && errors.status && (
                      <FormHelperText>{errors.status}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl 
                    fullWidth
                    error={touched.eligible_grades && Boolean(errors.eligible_grades)}
                  >
                    <InputLabel id="grades-label">Eligible Grades</InputLabel>
                    <Select
                      labelId="grades-label"
                      id="eligible_grades"
                      name="eligible_grades"
                      multiple
                      value={values.eligible_grades}
                      onChange={handleChange}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={`Grade ${value}`} />
                          ))}
                        </Box>
                      )}
                    >
                      {grades.map((grade) => (
                        <MenuItem key={grade} value={grade}>
                          Grade {grade}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.eligible_grades && errors.eligible_grades && (
                      <FormHelperText>{errors.eligible_grades}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="featured-label">Featured</InputLabel>
                    <Select
                      labelId="featured-label"
                      id="featured"
                      name="featured"
                      value={values.featured}
                      label="Featured"
                      onChange={handleChange}
                    >
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                    <FormHelperText>
                      Featured workshops appear on the homepage carousel
                    </FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                      type="button"
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigate('/admin/workshops')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                      {isSubmitting ? 'Saving...' : isEditMode ? 'Update Workshop' : 'Create Workshop'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default WorkshopForm;