import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  makeStyles,
} from '@material-ui/core';
import { Alert, Rating } from '@material-ui/lab';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
  },
  addButton: {
    marginBottom: theme.spacing(3),
  },
  pendingReviews: {
    marginTop: theme.spacing(4),
  },
  reviewCard: {
    marginBottom: theme.spacing(2),
  },
}));

const ProfessorDashboard = () => {
  const classes = useStyles();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [pendingReviews, setPendingReviews] = useState([]);
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchPendingReviews();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`/outlet/${user.id}`);
      setCourses(response.data);
    } catch (err) {
      setError('Failed to fetch courses');
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const pendingReviewsPromises = courses.map(course =>
        axios.get(`/outlet/to_reply/${course._id}`)
      );
      const responses = await Promise.all(pendingReviewsPromises);
      const allPendingReviews = responses.flatMap(response => response.data);
      setPendingReviews(allPendingReviews);
    } catch (err) {
      console.error('Failed to fetch pending reviews');
    }
  };

  const handleCreateCourse = async () => {
    try {
      await axios.post('/outlet', courseData);
      setOpenDialog(false);
      setCourseData({ title: '', description: '' });
      fetchCourses();
    } catch (err) {
      setError('Failed to create course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await axios.delete(`/outlet/${courseId}`);
      fetchCourses();
    } catch (err) {
      setError('Failed to delete course');
    }
  };

  const handleReplySubmit = async () => {
    try {
      await axios.put(
        `/api/outlet/reply/${selectedReview.courseId}/${selectedReview._id}`,
        { reply: replyText }
      );
      setOpenReplyDialog(false);
      setReplyText('');
      setSelectedReview(null);
      fetchPendingReviews();
    } catch (err) {
      setError('Failed to submit reply');
    }
  };

  return (
    <Container className={classes.root}>
      <Button
        variant="contained"
        color="primary"
        className={classes.addButton}
        onClick={() => setOpenDialog(true)}
      >
        Create New Course
      </Button>

      {error && (
        <Alert severity="error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course._id}>
            <Card className={classes.card}>
              <CardContent className={classes.cardContent}>
                <Typography gutterBottom variant="h5" component="h2">
                  {course.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {course.description}
                </Typography>
                <div style={{ marginTop: '1rem' }}>
                  <Rating value={course.averageRating} precision={0.5} readOnly />
                  <Typography variant="body2" color="textSecondary">
                    ({course.reviews.length} reviews)
                  </Typography>
                </div>
              </CardContent>
              <Button
                color="secondary"
                onClick={() => handleDeleteCourse(course._id)}
              >
                Delete Course
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      <div className={classes.pendingReviews}>
        <Typography variant="h5" gutterBottom>
          Pending Reviews
        </Typography>
        {pendingReviews.map((review) => (
          <Card key={review._id} className={classes.reviewCard}>
            <CardContent>
              <Typography variant="subtitle2">
                By: {review.student.username}
              </Typography>
              <Rating value={review.rating} readOnly />
              <Typography variant="body1" paragraph>
                {review.comment}
              </Typography>
              <Button
                color="primary"
                onClick={() => {
                  setSelectedReview(review);
                  setOpenReplyDialog(true);
                }}
              >
                Reply
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Course Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Course</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Course Title"
            fullWidth
            value={courseData.title}
            onChange={(e) =>
              setCourseData({ ...courseData, title: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Course Description"
            fullWidth
            multiline
            rows={4}
            value={courseData.description}
            onChange={(e) =>
              setCourseData({ ...courseData, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateCourse} color="primary" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog
        open={openReplyDialog}
        onClose={() => setOpenReplyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reply to Review</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            variant="outlined"
            label="Your Reply"
            fullWidth
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReplyDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleReplySubmit} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfessorDashboard; 