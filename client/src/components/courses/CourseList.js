import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  makeStyles,
  Button,
  Paper,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  filters: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff',
    padding: theme.spacing(2),
    zIndex: 1,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  formControl: {
    minWidth: 300,
  },
  reviewFormControl: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  courseSelect: {
    flexGrow: 1,
    maxWidth: 400,
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  reviewButton: {
    marginTop: theme.spacing(2),
  },
  courseGrid: {
    marginTop: theme.spacing(3),
  },
  loginPrompt: {
    padding: theme.spacing(6),
    textAlign: 'center',
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  buttonGroup: {
    marginTop: theme.spacing(2),
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

const CourseList = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: '',
  });

  useEffect(() => {
    const fetchCourses = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching courses...');
        const response = await axios.get('/outlet');
        console.log('Courses response:', response.data);
        setCourses(response.data);
      } catch (err) {
        console.error('Error details:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [isAuthenticated]);

  const handleSubmitReview = async () => {
    try {
      await axios.put(`/outlet/review/${selectedCourse}`, reviewData);
      setOpenReviewDialog(false);
      setReviewData({ rating: 0, comment: '' });
      // Refresh courses to show updated ratings
      const response = await axios.get('/outlet');
      setCourses(response.data);
    } catch (err) {
      setError('Failed to submit review');
    }
  };

  const filteredCourses = courses.filter(course => 
    ratingFilter === 'all' || Math.floor(course.averageRating) === parseInt(ratingFilter)
  );

  const selectedCourseData = courses.find(course => course._id === selectedCourse);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" className={classes.root}>
        <Paper className={classes.loginPrompt} elevation={3}>
          <Typography variant="h4" gutterBottom>
            Welcome to the Feedback System
          </Typography>
          <Typography variant="body1" paragraph>
            Please log in or register to view and interact with courses.
          </Typography>
          <div className={classes.buttonGroup}>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/login"
              size="large"
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/register"
              size="large"
            >
              Register
            </Button>
          </div>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <div className={classes.root}>
        <Typography>Loading...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.root}>
        <Typography color="error">{error}</Typography>
        <Button
          color="primary"
          onClick={() => window.location.reload()}
          style={{ marginTop: '1rem' }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Grid container direction="column" spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.filters}>
            <FormControl variant="outlined" className={classes.courseSelect}>
              <InputLabel>Select Course</InputLabel>
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                label="Select Course"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" className={classes.formControl}>
              <InputLabel>Rating Filter</InputLabel>
              <Select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                label="Rating Filter"
              >
                <MenuItem value="all">All Ratings</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
                <MenuItem value="4">4 Stars</MenuItem>
                <MenuItem value="3">3 Stars</MenuItem>
                <MenuItem value="2">2 Stars</MenuItem>
                <MenuItem value="1">1 Star</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {selectedCourseData && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {selectedCourseData.title}
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  {selectedCourseData.description}
                </Typography>
                <div className={classes.rating}>
                  <Rating value={selectedCourseData.averageRating} precision={0.5} readOnly />
                  <Typography variant="body2" color="textSecondary" style={{ marginLeft: 8 }}>
                    ({selectedCourseData.reviews.length} reviews)
                  </Typography>
                </div>
                {user.role === 'student' && (
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.reviewButton}
                    onClick={() => setOpenReviewDialog(true)}
                  >
                    Write a Review
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} className={classes.courseGrid}>
          <Typography variant="h6" gutterBottom>
            All Courses
          </Typography>
          <Grid container spacing={3}>
            {filteredCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <Card className={classes.card}>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p" gutterBottom>
                      {course.description}
                    </Typography>
                    <div className={classes.rating}>
                      <Rating value={course.averageRating} precision={0.5} readOnly />
                      <Typography variant="body2" color="textSecondary" component="span" style={{ marginLeft: 8 }}>
                        ({course.reviews.length} reviews)
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Review Dialog */}
      <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <div style={{ marginBottom: 16, marginTop: 8 }}>
            <Typography component="legend">Your Rating</Typography>
            <Rating
              value={reviewData.rating}
              onChange={(event, newValue) => {
                setReviewData({ ...reviewData, rating: newValue });
              }}
            />
          </div>
          <TextField
            autoFocus
            margin="dense"
            label="Your Review"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={reviewData.comment}
            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
            className={classes.reviewFormControl}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReviewDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmitReview} color="primary" variant="contained">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseList; 