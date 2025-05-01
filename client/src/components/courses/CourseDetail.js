import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  makeStyles,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
import { Alert, Rating } from '@material-ui/lab';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  header: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  reviewCard: {
    marginBottom: theme.spacing(2),
  },
  replySection: {
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    borderLeft: `2px solid ${theme.palette.primary.main}`,
  },
}));

const CourseDetail = () => {
  const classes = useStyles();
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/outlet/outletId/${id}`);
        setCourse(response.data);
      } catch (err) {
        setError('Failed to fetch course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleReviewSubmit = async () => {
    try {
      const response = await axios.put(`/api/outlet/review/${id}`, reviewData);
      setCourse(response.data);
      setOpenReviewDialog(false);
      setReviewData({ rating: 5, comment: '' });
    } catch (err) {
      setError('Failed to submit review');
    }
  };

  const handleReplySubmit = async () => {
    try {
      const response = await axios.put(
        `/api/outlet/reply/${id}/${selectedReview._id}`,
        { reply: replyText }
      );
      setCourse(response.data);
      setOpenReplyDialog(false);
      setReplyText('');
      setSelectedReview(null);
    } catch (err) {
      setError('Failed to submit reply');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!course) {
    return <Typography>Course not found</Typography>;
  }

  const highestRatedReview = [...course.reviews].sort((a, b) => b.rating - a.rating)[0];
  const lowestRatedReview = [...course.reviews].sort((a, b) => a.rating - b.rating)[0];

  return (
    <Container className={classes.root}>
      <Paper className={classes.header}>
        <Typography variant="h4" gutterBottom>
          {course.title}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Professor: {course.professor.username}
        </Typography>
        <Typography variant="body1" paragraph>
          {course.description}
        </Typography>
        <div className={classes.rating}>
          <Rating value={course.averageRating} precision={0.5} readOnly />
          <Typography variant="body2" color="textSecondary" component="span">
            ({course.reviews.length} reviews)
          </Typography>
        </div>
        {user.role === 'student' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenReviewDialog(true)}
            style={{ marginTop: '1rem' }}
          >
            Write Review
          </Button>
        )}
      </Paper>

      <Grid container spacing={3}>
        {highestRatedReview && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Highest Rated Review
                </Typography>
                <Rating value={highestRatedReview.rating} readOnly />
                <Typography variant="body1">{highestRatedReview.comment}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {lowestRatedReview && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lowest Rated Review
                </Typography>
                <Rating value={lowestRatedReview.rating} readOnly />
                <Typography variant="body1">{lowestRatedReview.comment}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Typography variant="h5" style={{ margin: '2rem 0 1rem' }}>
        All Reviews
      </Typography>

      {course.reviews.map((review) => (
        <Card key={review._id} className={classes.reviewCard}>
          <CardContent>
            <Typography variant="subtitle2">
              By: {review.student.username}
            </Typography>
            <Rating value={review.rating} readOnly />
            <Typography variant="body1" paragraph>
              {review.comment}
            </Typography>
            {review.reply && (
              <div className={classes.replySection}>
                <Typography variant="subtitle2" color="primary">
                  Professor's Reply:
                </Typography>
                <Typography variant="body1">{review.reply}</Typography>
              </div>
            )}
            {user.role === 'professor' &&
              course.professor._id === user.id &&
              !review.reply && (
                <Button
                  color="primary"
                  onClick={() => {
                    setSelectedReview(review);
                    setOpenReplyDialog(true);
                  }}
                >
                  Reply
                </Button>
              )}
          </CardContent>
        </Card>
      ))}

      {/* Review Dialog */}
      <Dialog
        open={openReviewDialog}
        onClose={() => setOpenReviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Rating
            value={reviewData.rating}
            onChange={(event, newValue) => {
              setReviewData({ ...reviewData, rating: newValue });
            }}
            size="large"
            style={{ marginBottom: '1rem' }}
          />
          <TextField
            autoFocus
            multiline
            rows={4}
            variant="outlined"
            label="Your Review"
            fullWidth
            value={reviewData.comment}
            onChange={(e) =>
              setReviewData({ ...reviewData, comment: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReviewDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleReviewSubmit} color="primary" variant="contained">
            Submit
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

export default CourseDetail; 