import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

export default function Profile() {
  const { currentUser } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserInfo(docSnap.data());
          setEditData(docSnap.data());
        } else {
          // Create initial user document if it doesn't exist
          const initialData = {
            email: currentUser.email,
            createdAt: new Date().toISOString()
          };
          setUserInfo(initialData);
          setEditData(initialData);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    const fetchOrderHistory = async () => {
      try {
        setOrdersLoading(true);
        const orderQuery = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(orderQuery);
        const orderData = [];
        
        querySnapshot.forEach((doc) => {
          orderData.push({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamp to readable date
            orderDate: doc.data().createdAt ? 
              new Date(doc.data().createdAt.toDate()).toLocaleString() : 
              'Unknown date'
          });
        });
        
        // Sort orders by date (newest first)
        orderData.sort((a, b) => {
          return new Date(b.orderDate) - new Date(a.orderDate);
        });
        
        setOrders(orderData);
      } catch (err) {
        console.error('Error fetching order history:', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (currentUser?.uid) {
      fetchUserData();
      fetchOrderHistory();
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If we're canceling edit, reset form data
      setEditData(userInfo);
    }
    setIsEditing(!isEditing);
    setMessage('');
    setError('');
  };

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      setMessage('');
      setError('');
      
      // Form validation
      if (!editData.userName?.trim()) {
        setError('Name is required');
        setIsSubmitting(false);
        return;
      }
      
      if (!editData.phone?.trim()) {
        setError('Phone number is required');
        setIsSubmitting(false);
        return;
      }
      
      const docRef = doc(db, 'users', currentUser.uid);
      await updateDoc(docRef, editData);
      setUserInfo(editData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get total order count and spending
  const getOrderSummary = () => {
    const totalOrders = orders.length;
    const totalSpending = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    return { totalOrders, totalSpending };
  };

  // Function to format status with color coding
  const getStatusChip = (status) => {
    let color = 'default';
    
    switch(status?.toLowerCase()) {
      case 'pending':
        color = 'warning';
        break;
      case 'paid':
        color = 'info';
        break;
      case 'shipped':
        color = 'primary';
        break;
      case 'delivered':
        color = 'success';
        break;
      case 'cancelled':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={status || 'Processing'} color={color} size="small" />;
  };

  if (loading) return (
    <Container maxWidth="sm" sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Container>
  );

  if (!userInfo) return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Alert severity="error">Failed to load profile information</Alert>
    </Container>
  );

  const { totalOrders, totalSpending } = getOrderSummary();

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      {/* Profile Information Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Your Profile
          </Typography>
          <Button 
            variant="outlined" 
            color={isEditing ? "error" : "primary"}
            onClick={handleEditToggle}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </Box>
        
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box>
          <TextField 
            fullWidth 
            label="Your Name" 
            name="userName" 
            value={editData.userName || ''} 
            onChange={handleChange} 
            margin="normal" 
            disabled={!isEditing}
            required
          />
          <TextField 
            fullWidth 
            label="Patient Name" 
            name="patientName" 
            value={editData.patientName || ''} 
            onChange={handleChange} 
            margin="normal" 
            disabled={!isEditing}
          />
          <TextField 
            fullWidth 
            label="Email" 
            name="email" 
            value={editData.email || ''} 
            onChange={handleChange} 
            margin="normal" 
            disabled={true} // Email should not be editable
          />
          <TextField 
            fullWidth 
            label="Phone" 
            name="phone" 
            value={editData.phone || ''} 
            onChange={handleChange} 
            margin="normal"
            disabled={!isEditing}
            required
          />
          <TextField 
            fullWidth 
            label="Gender" 
            name="gender" 
            value={editData.gender || ''} 
            onChange={handleChange} 
            margin="normal"
            disabled={!isEditing} 
          />
          <TextField 
            fullWidth 
            label="Age" 
            name="age" 
            value={editData.age || ''} 
            onChange={handleChange} 
            margin="normal"
            disabled={!isEditing}
            type="number" 
          />
          
          {editData.hasDisease && (
            <>
              <TextField 
                fullWidth 
                label="Disease/Infection" 
                name="disease" 
                value={editData.disease || ''} 
                onChange={handleChange} 
                margin="normal"
                disabled={!isEditing}
              />
              <TextField 
                fullWidth 
                label="Suffering Duration" 
                name="duration" 
                value={editData.duration || ''} 
                onChange={handleChange} 
                margin="normal"
                disabled={!isEditing}
              />
            </>
          )}
          
          {isEditing && (
            <Button 
              onClick={handleUpdate} 
              variant="contained" 
              fullWidth 
              sx={{ mt: 3 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Update Profile'}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Purchase History Section */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Your Purchase History
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {ordersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Alert severity="info">You haven't made any purchases yet.</Alert>
        ) : (
          <>
            {/* Order Summary */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">Total Orders</Typography>
                    <Typography variant="h4" color="primary">{totalOrders}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">Total Spending</Typography>
                    <Typography variant="h4" color="primary">₹{totalSpending.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Order List */}
            {orders.map((order) => (
              <Accordion key={order.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">
                        Order #{order.id.substring(0, 8)}...
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.orderDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {getStatusChip(order.status)}
                      <Typography variant="subtitle1">
                        ₹{order.total?.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* Order items */}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Items:</Typography>
                  <Grid container spacing={1}>
                    {order.items?.map((item, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          p: 1,
                          borderBottom: '1px solid #eee' 
                        }}>
                          <Typography variant="body2">
                            {item.name} x {item.quantity}
                          </Typography>
                          <Typography variant="body2">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {/* Shipping details */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Shipping Address:</Typography>
                    <Typography variant="body2">
                      {order.deliveryAddress}
                    </Typography>
                    <Typography variant="body2">
                      PIN: {order.pinCode}
                    </Typography>
                  </Box>
                  
                  {/* Payment details */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Payment Method:</Typography>
                    <Typography variant="body2">
                      {order.paymentMode === 'cashOnDelivery' ? 'Cash on Delivery' : 
                       order.paymentMode === 'upiPayment' ? 'UPI Payment' : 
                       order.paymentMode === 'cardPayment' ? 'Card Payment' : 'Unknown'}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        )}
      </Paper>
    </Container>
  );
}