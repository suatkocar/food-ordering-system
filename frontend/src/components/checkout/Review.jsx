import * as React from 'react';
import { useSelector } from 'react-redux';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Review() {
  const cart = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.user.user);
  const paymentType = useSelector((state) => state.payment.selectedPaymentType);
  const paymentDetails = useSelector((state) => state.payment.paymentDetails);

  // Debugging: Log user data
  React.useEffect(() => {
    console.log("User data in Review:", user);
  }, [user]);

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return 'xxxx-xxxx-xxxx-xxxx';
    const lastFourDigits = cardNumber.slice(-4);
    return `xxxx-xxxx-xxxx-${lastFourDigits}`;
  };

  const getCardType = (cardNumber) => {
    if (!cardNumber) return 'N/A';
    const firstDigit = cardNumber[0];
    switch (firstDigit) {
      case '2':
      case '5':
        return 'Mastercard';
      case '3':
        return 'American Express';
      case '4':
        return 'Visa';
      default:
        return 'Unknown';
    }
  };

  const paymentDisplay = paymentType === 'creditCard' ? [
    { name: 'Card type:', detail: getCardType(paymentDetails.cardNumber) },
    { name: 'Card holder:', detail: paymentDetails.cardName || 'N/A' },
    { name: 'Card number:', detail: maskCardNumber(paymentDetails.cardNumber) },
    { name: 'Expiry date:', detail: paymentDetails.expirationDate || 'MM/YY' },
  ] : paymentType === 'bankTransfer' ? [
    { name: 'Bank:', detail: 'Mastercredit' },
    { name: 'Account number:', detail: '123456789' },
    { name: 'Routing number:', detail: '987654321' },
  ] : [];

  const calculateTotalPrice = (cart) =>
    Object.values(cart)
      .reduce(
        (total, item) =>
          total + (item.DynamicPrice ? item.DynamicPrice : 0) * item.quantity,
        0
      )
      .toFixed(2);

  return (
    <Stack spacing={2}>
      <List disablePadding>
        {Object.keys(cart).map((productID) => {
          const product = cart[productID];
          if (!product) return null;

          const dynamicPrice = parseFloat(product.DynamicPrice) || 0;

          return (
            <ListItem key={productID} sx={{ py: 1, px: 0 }}>
              <ListItemText
                primary={product.Name}
                secondary={`£${dynamicPrice.toFixed(2)} x ${product.quantity}`}
              />
              <Typography variant="body2">
                £{(dynamicPrice * product.quantity).toFixed(2)}
              </Typography>
            </ListItem>
          );
        })}

        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Total" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            £{(parseFloat(calculateTotalPrice(cart))).toFixed(2)}
          </Typography>
        </ListItem>
      </List>
      <Divider />
      <Stack
        direction="column"
        divider={<Divider flexItem />}
        spacing={2}
        sx={{ my: 2 }}
      >
        <div>
          <Typography variant="subtitle2" gutterBottom>
            Shipment details
          </Typography>
          <Typography gutterBottom>{user?.name || user?.Name || 'N/A'}</Typography>
          <Typography gutterBottom sx={{ color: 'text.secondary' }}>
            {user?.address || user?.Address || 'N/A'}
          </Typography>
          <Typography gutterBottom sx={{ color: 'text.secondary' }}>
            {user?.phone || user?.Phone || 'N/A'}
          </Typography>
        </div>
        <div>
          <Typography variant="subtitle2" gutterBottom>
            Payment details
          </Typography>
          <Grid container>
            {paymentDisplay.map((payment) => (
              <React.Fragment key={payment.name}>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ width: '100%', mb: 1 }}
                >
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {payment.name}
                  </Typography>
                  <Typography variant="body2">{payment.detail}</Typography>
                </Stack>
              </React.Fragment>
            ))}
          </Grid>
        </div>
      </Stack>
    </Stack>
  );
}
