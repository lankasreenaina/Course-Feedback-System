import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, CssBaseline } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CourseList from './components/courses/CourseList';
import CourseDetail from './components/courses/CourseDetail';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ProfessorDashboard from './components/dashboard/ProfessorDashboard';
import { AuthProvider } from './contexts/AuthContext';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(2),
  },
}));

function App() {
  const classes = useStyles();

  return (
    <AuthProvider>
      <div className={classes.root}>
        <CssBaseline />
        <Navbar />
        <Container component="main" className={classes.main}>
          <Routes>
            <Route path="/" element={<CourseList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/professor" element={<ProfessorDashboard />} />
          </Routes>
        </Container>
      </div>
    </AuthProvider>
  );
}

export default App;
