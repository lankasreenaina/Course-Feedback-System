import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  makeStyles,
  Tabs,
  Tab,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
import { Alert, Rating } from '@material-ui/lab';
import axios from '../../utils/axios';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(2),
  },
  cardContent: {
    flexGrow: 1,
  },
  formControl: {
    minWidth: 120,
    marginBottom: theme.spacing(2),
  },
  tabPanel: {
    marginTop: theme.spacing(2),
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const AdminDashboard = () => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/outlet');
      setCourses(response.data);
    } catch (err) {
      setError('Failed to fetch courses');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/users/change/${newRole}/${userId}`);
      fetchUsers();
    } catch (err) {
      setError('Failed to change user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    setConfirmDialog({
      open: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user?',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/users/${userId}`);
          fetchUsers();
        } catch (err) {
          setError('Failed to delete user');
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleDeleteCourse = async (courseId) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Course',
      message: 'Are you sure you want to delete this course?',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/outlet/${courseId}`);
          fetchCourses();
        } catch (err) {
          setError('Failed to delete course');
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleDeleteReview = async (courseId, reviewId) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review?',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/outlet/review/${courseId}/${reviewId}`);
          fetchCourses();
        } catch (err) {
          setError('Failed to delete review');
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  return (
    <Container className={classes.root}>
      {error && (
        <Alert severity="error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Users" />
        <Tab label="Courses" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} key={user._id}>
              <Card className={classes.card}>
                <CardContent className={classes.cardContent}>
                  <Typography variant="h6">{user.username}</Typography>
                  <FormControl className={classes.formControl}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user._id, e.target.value)}
                    >
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="professor">Professor</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    color="secondary"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    Delete User
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} key={course._id}>
              <Card className={classes.card}>
                <CardContent className={classes.cardContent}>
                  <Typography variant="h6">{course.title}</Typography>
                  <Typography color="textSecondary">
                    Professor: {course.professor.username}
                  </Typography>
                  <div style={{ margin: '1rem 0' }}>
                    <Rating value={course.averageRating} precision={0.5} readOnly />
                    <Typography variant="body2" color="textSecondary">
                      ({course.reviews.length} reviews)
                    </Typography>
                  </div>
                  <Button
                    color="secondary"
                    onClick={() => handleDeleteCourse(course._id)}
                  >
                    Delete Course
                  </Button>
                  <Typography variant="h6" style={{ marginTop: '1rem' }}>
                    Reviews:
                  </Typography>
                  {course.reviews.map((review) => (
                    <Card
                      key={review._id}
                      style={{ margin: '0.5rem 0', padding: '0.5rem' }}
                    >
                      <Typography variant="subtitle2">
                        By: {review.student.username}
                      </Typography>
                      <Rating value={review.rating} readOnly />
                      <Typography variant="body2">{review.comment}</Typography>
                      {review.reply && (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          style={{ marginTop: '0.5rem' }}
                        >
                          Reply: {review.reply}
                        </Typography>
                      )}
                      <Button
                        color="secondary"
                        size="small"
                        onClick={() =>
                          handleDeleteReview(course._id, review._id)
                        }
                      >
                        Delete Review
                      </Button>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            color="secondary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 