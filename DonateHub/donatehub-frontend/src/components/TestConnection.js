import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Refresh,
  Storage,
  Send,
  GetApp,
} from '@mui/icons-material';

// Import the APIs - IMPORTANT: These are named exports
import { testAPI, donationAPI } from '../services/api';

const TestConnection = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    health: null,
    dbTest: null,
    testPost: null,
    testGet: null,
    createDonation: null,
  });
  const [errors, setErrors] = useState({});

  const testHealth = async () => {
    setLoading(true);
    try {
      const result = await testAPI.health();
      setResults(prev => ({ ...prev, health: result }));
      setErrors(prev => ({ ...prev, health: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, health: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const testDB = async () => {
    setLoading(true);
    try {
      const result = await testAPI.dbTest();
      setResults(prev => ({ ...prev, dbTest: result }));
      setErrors(prev => ({ ...prev, dbTest: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, dbTest: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const testPost = async () => {
    setLoading(true);
    try {
      const result = await testAPI.testPost({
        message: 'Test POST from frontend',
        timestamp: new Date().toISOString(),
        test: 'database_write'
      });
      setResults(prev => ({ ...prev, testPost: result }));
      setErrors(prev => ({ ...prev, testPost: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, testPost: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const testGet = async () => {
    setLoading(true);
    try {
      const result = await testAPI.testGet();
      setResults(prev => ({ ...prev, testGet: result }));
      setErrors(prev => ({ ...prev, testGet: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, testGet: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const testCreateDonation = async () => {
    setLoading(true);
    try {
      const result = await donationAPI.createTestDonation();
      setResults(prev => ({ ...prev, createDonation: result }));
      setErrors(prev => ({ ...prev, createDonation: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, createDonation: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    await testHealth();
    await testDB();
    await testPost();
    await testGet();
    await testCreateDonation();
    setLoading(false);
  };

  useEffect(() => {
    testHealth();
  }, []);

  const TestCard = ({ title, icon, status, error, result, onTest }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {status === 'success' && (
          <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
            Success
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" icon={<Error />} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {result && (
          <Box sx={{ mt: 2 }}>
            <Chip 
              label="Success" 
              color="success" 
              size="small" 
              icon={<CheckCircle />}
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Response: {JSON.stringify(result).substring(0, 100)}...
            </Typography>
          </Box>
        )}
        
        <Button
          variant="outlined"
          fullWidth
          onClick={onTest}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          Test {title}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Database Connection Tester
        </Typography>
        <Typography color="text.secondary" paragraph>
          Test your connection to the backend and MongoDB database
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={runAllTests}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
            sx={{ mr: 2 }}
          >
            Run All Tests
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setResults({});
              setErrors({});
            }}
          >
            Clear Results
          </Button>
        </Box>
        
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography>Running tests...</Typography>
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TestCard
            title="Server Health"
            icon={<Storage />}
            status={results.health?.status === 'healthy' ? 'success' : null}
            error={errors.health}
            result={results.health}
            onTest={testHealth}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TestCard
            title="Database Read/Write"
            icon={<Storage />}
            status={results.dbTest?.success ? 'success' : null}
            error={errors.dbTest}
            result={results.dbTest}
            onTest={testDB}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TestCard
            title="POST to Database"
            icon={<Send />}
            status={results.testPost?.success ? 'success' : null}
            error={errors.testPost}
            result={results.testPost}
            onTest={testPost}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TestCard
            title="GET from Database"
            icon={<GetApp />}
            status={results.testGet?.success ? 'success' : null}
            error={errors.testGet}
            result={results.testGet}
            onTest={testGet}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TestCard
            title="Create Donation"
            icon={<Send />}
            status={results.createDonation?.success ? 'success' : null}
            error={errors.createDonation}
            result={results.createDonation}
            onTest={testCreateDonation}
          />
        </Grid>
      </Grid>
      
      {/* Summary */}
      {(results.health || results.dbTest) && (
        <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Connection Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Server Status
              </Typography>
              <Chip 
                label={results.health?.status || 'Unknown'} 
                color={results.health?.status === 'healthy' ? 'success' : 'error'}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Database
              </Typography>
              <Chip 
                label={results.dbTest?.success ? 'Connected' : 'Disconnected'} 
                color={results.dbTest?.success ? 'success' : 'error'}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Write Test
              </Typography>
              <Chip 
                label={results.testPost?.success ? 'Success' : 'Failed'} 
                color={results.testPost?.success ? 'success' : 'error'}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Read Test
              </Typography>
              <Chip 
                label={results.testGet?.success ? 'Success' : 'Failed'} 
                color={results.testGet?.success ? 'success' : 'error'}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default TestConnection;