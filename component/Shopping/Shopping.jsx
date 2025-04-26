import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  AddShoppingCart,
  RemoveShoppingCart,
  ShoppingCart,
  Info,
  Search as SearchIcon,
  QrCode2 as QrCodeIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { loadHerbalProductData, loadEcommerceProductData } from '../../data/csvData';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react'; // Fixed import to use the named export

function Shopping() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [plants, setPlants] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [view, setView] = useState('plants'); // 'plants' or 'products'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [upiCopied, setUpiCopied] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Checkout form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [paymentMode, setPaymentMode] = useState('cashOnDelivery');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCvv] = useState('');
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Checkout Form
  const [error, setError] = useState('');

  // Constants for UPI payment
  const UPI_ID = "prathmeshdongale04-1@oksbi";
  const MERCHANT_NAME = "HerbalShop";

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await loadEcommerceProductData();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Error loading products. Please try again later.');
      }
    };

    const loadPlants = async () => {
      try {
        const plantsData = await loadHerbalProductData();
        setPlants(plantsData);
      } catch (error) {
        console.error('Error loading plants:', error);
        setError('Error loading plants. Please try again later.');
      }
    };

    loadProducts();
    loadPlants();
  }, []);

  useEffect(() => {
    // Pre-populate form with user data if logged in
    if (currentUser) {
      // You could fetch user data from Firebase here
      // For now using placeholder until we integrate with your user profile
    }
  }, [currentUser]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) => item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) => prevCart.map((item) => item.id === productId ? { ...item, quantity } : item
    )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleProceedToCheckout = () => {
    setCheckoutStep(2);
  };

  const handleCheckout = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      // Basic validation
      if (!name || !email || !phone || !deliveryAddress || !pinCode) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      if (paymentMode === 'upiPayment' && !upiId) {
        setError('Please enter your UPI ID');
        setIsSubmitting(false);
        return;
      }

      if (paymentMode === 'cardPayment' && (!cardNumber || !cardExpiry || !cardCvv)) {
        setError('Please enter all card details');
        setIsSubmitting(false);
        return;
      }

      // Generate orderId if not already generated for QR code payment
      const newOrderId = orderId || `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const order = {
        id: newOrderId,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: calculateTotal(),
        name,
        email,
        phone,
        deliveryAddress,
        pinCode,
        paymentMode,
        status: paymentMode === 'cashOnDelivery' ? 'pending' : 'paid',
        userId: currentUser?.uid || 'guest',
        createdAt: serverTimestamp(),
      };

      // Store in Firebase
      await addDoc(collection(db, 'orders'), order);

      // Show success message
      setOrderSuccess(true);
      setCart([]);
      setName('');
      setEmail('');
      setPhone('');
      setDeliveryAddress('');
      setPinCode('');
      setUpiId('');
      setCardNumber('');
      setCardExpiry('');
      setCvv('');
      setPaymentMode('cashOnDelivery');
      setCheckoutStep(1);
      setOrderId('');

      // Auto close after 3 seconds
      setTimeout(() => {
        setIsCartOpen(false);
        setOrderSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQrCodePayment = () => {
    // Generate a unique order ID
    const newOrderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setOrderId(newOrderId);

    // Format the amount to 2 decimal places
    const formattedAmount = calculateTotal().toFixed(2);

    // Create the UPI payment URL with your UPI ID
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${MERCHANT_NAME}&am=${formattedAmount}&tr=${newOrderId}&cu=INR`;

    setPaymentUrl(upiUrl);
    setQrCodeDialogOpen(true);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2000);
  };

  const handleQrCodeClose = () => {
    setQrCodeDialogOpen(false);
    // In a real implementation, you'd verify the payment
    // For now, we'll simulate a successful payment
    handleCheckout();
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleViewChange = (_, newView) => {
    if (newView) setView(newView);
  };

  const filteredData = (data) => data.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = (data) => {
    return data.sort((a, b) => {
      if (sortOrder === 'asc') return a.price - b.price;
      if (sortOrder === 'desc') return b.price - a.price;
      return 0;
    });
  };


  const dataToDisplay = view === 'plants' ? plants : products;
  const filteredAndSortedData = sortedData(filteredData(dataToDisplay));
  const paginatedData = filteredAndSortedData;

  const handleDrawerClose = () => {
    setIsCartOpen(false);
    setCheckoutStep(1); // Reset to cart view when closing
  };

  const renderCartContent = () => (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Shopping Cart
      </Typography>

      {cart.length === 0 ? (
        <Typography variant="body1" sx={{ my: 4, textAlign: 'center' }}>
          Your cart is empty
        </Typography>
      ) : (
        <>
          <List>
            {cart.map((item) => (
              <ListItem key={item.id}>
                <ListItemText
                  primary={item.name}
                  secondary={`₹${item.price.toFixed(2)} x ${item.quantity}`} />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    size="small"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                  <Button
                    size="small"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </Button>
                  <IconButton color="error" onClick={() => removeFromCart(item.id)}>
                    <RemoveShoppingCart />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>

          <Divider />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Total: ₹{calculateTotal().toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleProceedToCheckout}
            sx={{ mt: 2 }}
          >
            Proceed to Checkout
          </Button>
        </>
      )}
    </>
  );

  const renderCheckoutForm = () => (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Checkout
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          required />
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required />
        <TextField
          fullWidth
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          margin="normal"
          required />
        <TextField
          fullWidth
          label="Delivery Address"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          margin="normal"
          multiline
          rows={3}
          required />
        <TextField
          fullWidth
          label="PIN Code"
          value={pinCode}
          onChange={(e) => setPinCode(e.target.value)}
          margin="normal"
          required />

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Payment Method
        </Typography>
        <RadioGroup
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
        >
          <FormControlLabel
            value="cashOnDelivery"
            control={<Radio />}
            label="Cash on Delivery" />
          <FormControlLabel
            value="upiPayment"
            control={<Radio />}
            label="UPI Payment" />
          <FormControlLabel
            value="cardPayment"
            control={<Radio />}
            label="Card Payment" />
        </RadioGroup>

        {paymentMode === 'upiPayment' && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="UPI ID (e.g. name@upi)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              margin="normal"
              required />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<QrCodeIcon />}
              sx={{ mt: 1 }}
              onClick={handleQrCodePayment}
            >
              Pay via QR Code
            </Button>
          </Box>
        )}

        {paymentMode === 'cardPayment' && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              margin="normal"
              required />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Expiry (MM/YY)"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                margin="normal"
                required
                sx={{ flex: 1 }} />
              <TextField
                label="CVV"
                value={cardCvv}
                onChange={(e) => setCvv(e.target.value)}
                margin="normal"
                required
                type="password"
                sx={{ flex: 1 }} />
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setCheckoutStep(1)}
            disabled={isSubmitting}
          >
            Back to Cart
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckout}
            disabled={isSubmitting || !name || !email || !phone || !deliveryAddress || !pinCode ||
              (paymentMode === 'upiPayment' && !upiId) ||
              (paymentMode === 'cardPayment' && (!cardNumber || !cardExpiry || !cardCvv))}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Place Order'}
          </Button>
        </Box>
      </Box>
    </>
  );

  const renderQrCodeDialog = () => (
    <Dialog open={qrCodeDialogOpen} onClose={() => setQrCodeDialogOpen(false)} maxWidth="sm">
      <DialogTitle>Scan QR Code to Pay</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          {/* Dynamic QR code based on payment URL */}
          {paymentUrl && (
            <QRCodeSVG
              value={paymentUrl}
              size={250}
              level="H"
              includeMargin={true} />
          )}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Total: ₹{calculateTotal().toFixed(2)}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, width: '100%', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              UPI ID: {UPI_ID}
            </Typography>
            <IconButton size="small" onClick={copyUpiId} color="primary">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            {upiCopied && (
              <Chip label="Copied!" size="small" color="success" sx={{ ml: 1 }} />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Scan this QR code with any UPI app (PhonePe, Google Pay, Paytm) to make payment.
            The amount of ₹{calculateTotal().toFixed(2)} will be automatically filled.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setQrCodeDialogOpen(false)}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleQrCodeClose}
        >
          I've Paid
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      {/* Success Notification */}
      {orderSuccess && (
        <Alert
          severity="success"
          sx={{
            position: 'fixed',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: '80%',
            maxWidth: '500px'
          }}
        >
          Order placed successfully! Thank you for your purchase.
        </Alert>
      )}

      {/* Top Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', p: 0 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="View selector"
          >
            <ToggleButton value="plants">Buy Plants</ToggleButton>
            <ToggleButton value="products">Buy Products</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              InputProps={{
                startAdornment: <SearchIcon />,
              }} />
            <FormControl sx={{ minWidth: 120, ml: 2 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Sort by"
                size="small"
              >
                <MenuItem value="asc">Price: Low to High</MenuItem>
                <MenuItem value="desc">Price: High to Low</MenuItem>
              </Select>
            </FormControl>

            <IconButton onClick={() => setIsCartOpen(true)} sx={{ ml: 2 }}>
              <Badge badgeContent={cart.length} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </Paper>

      {/* Grid Display */}
      <Grid container spacing={3}>
        {paginatedData.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                image={product.imageUrl}
                alt={product.name}
                sx={{
                  height: 200,
                  objectFit: 'contain',
                  backgroundColor: '#f5f5f5',
                  p: 1,
                }} />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.scientificName} – {product.category}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {product.description && product.description.length > 100
                    ? `${product.description.substring(0, 100)}...`
                    : product.description}
                </Typography>
                <Box sx={{ mt: 1, mb: 1 }}>
                  {product.benefits?.slice(0, 2).map((benefit, index) => (
                    <Chip key={index} label={benefit} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                  {product.benefits?.length > 2 && (
                    <Chip label="..." size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  )}
                  <Chip
                    label={`Stock: ${product.stock}`}
                    size="small"
                    color={product.stock > 0 ? 'success' : 'error'}
                    sx={{ mr: 0.5, mb: 0.5 }} />
                </Box>
                <Typography variant="h6" color="primary">
                  ₹{product.price?.toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddShoppingCart />}
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    Add to Cart
                  </Button>
                  <Button variant="outlined" startIcon={<Info />} onClick={() => handleProductClick(product)}>
                    Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Drawer for Cart */}
      <Drawer
        anchor="right"
        open={isCartOpen}
        onClose={handleDrawerClose}
      >
        <Box sx={{ width: 350, p: 3 }}>
          {checkoutStep === 1 ? renderCartContent() : renderCheckoutForm()}
        </Box>
      </Drawer>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onClose={() => setIsProductDialogOpen(false)} maxWidth="md">
        {selectedProduct && (
          <>
            <DialogTitle>{selectedProduct.name}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    sx={{ objectFit: 'contain' }} />
                </Box>
                <Box sx={{ flex: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ₹{selectedProduct.price?.toFixed(2)}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedProduct.description}
                  </Typography>
                  {selectedProduct.benefits && selectedProduct.benefits.length > 0 && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Benefits:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {selectedProduct.benefits.map((benefit, index) => (
                          <Chip key={index} label={benefit} />
                        ))}
                      </Box>
                    </>
                  )}
                  <Typography variant="subtitle1" gutterBottom>
                    Dosage:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedProduct.dosage || "Not specified"}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Origin:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedProduct.origin || "Not specified"}
                  </Typography>
                  <Chip
                    label={`Stock: ${selectedProduct.stock}`}
                    color={selectedProduct.stock > 0 ? 'success' : 'error'} />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsProductDialogOpen(false)}>Close</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  addToCart(selectedProduct);
                  setIsProductDialogOpen(false);
                }}
                disabled={selectedProduct.stock <= 0}
              >
                Add to Cart
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* QR Code Dialog */}
      {renderQrCodeDialog()}
    </Box>
  );
}

export default Shopping;