import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setPaymentType,
  setPaymentDetails,
} from "../../../redux/slices/paymentSlice";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import MuiCard from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import { styled } from "@mui/material/styles";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import SimCardRoundedIcon from "@mui/icons-material/SimCardRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { LogosVisa, LogosMastercard, FontistoAmericanExpress } from "./Logo";

const Card = styled(MuiCard)(({ theme }) => ({
  border: "1px solid",
  borderColor: theme.palette.divider,
  width: "100%",
  "&:hover": {
    background:
      "linear-gradient(to bottom right, hsla(210, 100%, 97%, 0.5) 25%, hsla(210, 100%, 90%, 0.3) 100%)",
    borderColor: "primary.light",
    boxShadow: "0px 2px 8px hsla(0, 0%, 0%, 0.1)",
    ...theme.applyStyles("dark", {
      background:
        "linear-gradient(to right bottom, hsla(210, 100%, 12%, 0.2) 25%, hsla(210, 100%, 16%, 0.2) 100%)",
      borderColor: "primary.dark",
      boxShadow: "0px 1px 8px hsla(210, 100%, 25%, 0.5) ",
    }),
  },
  [theme.breakpoints.up("md")]: {
    flexGrow: 1,
    maxWidth: `calc(50% - ${theme.spacing(1)})`,
  },
}));

const PaymentContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  width: "100%",
  height: 375,
  padding: theme.spacing(3),
  borderRadius: `calc(${theme.shape.borderRadius}px + 4px)`,
  border: "1px solid ",
  borderColor: theme.palette.divider,
  background:
    "linear-gradient(to bottom right, hsla(220, 35%, 97%, 0.3) 25%, hsla(220, 20%, 88%, 0.3) 100%)",
  boxShadow: "0px 4px 8px hsla(210, 0%, 0%, 0.05)",
  [theme.breakpoints.up("xs")]: {
    height: 300,
  },
  [theme.breakpoints.up("sm")]: {
    height: 350,
  },
  ...theme.applyStyles("dark", {
    background:
      "linear-gradient(to right bottom, hsla(220, 30%, 6%, 0.2) 25%, hsla(220, 20%, 25%, 0.2) 100%)",
    boxShadow: "0px 4px 8px hsl(220, 35%, 0%)",
  }),
}));

const FormGrid = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
}));

const getCardLogo = (cardNumber) => {
  if (!cardNumber) {
    return (
      <SimCardRoundedIcon
        sx={{
          fontSize: { xs: 48, sm: 56 },
          transform: "rotate(90deg)",
          color: "text.secondary",
        }}
      />
    );
  }
  const firstDigit = cardNumber[0];
  switch (firstDigit) {
    case "2":
      return <LogosMastercard />;
    case "3":
      return <FontistoAmericanExpress />;
    case "4":
      return <LogosVisa />;
    case "5":
      return <LogosMastercard />;
    default:
      return (
        <SimCardRoundedIcon
          sx={{
            fontSize: { xs: 48, sm: 56 },
            transform: "rotate(90deg)",
            color: "text.secondary",
          }}
        />
      );
  }
};

export default function PaymentForm({ onFormValidityChange }) {
  const dispatch = useDispatch();
  const paymentType = useSelector((state) => state.payment.selectedPaymentType);
  const paymentDetails = useSelector((state) => state.payment.paymentDetails);

  const [errors, setErrors] = React.useState({
    cardNumber: false,
    cvv: false,
    expirationDate: false,
    cardName: false,
  });

  React.useEffect(() => {
    if (!paymentType) {
      dispatch(setPaymentType("creditCard"));
    }
  }, [dispatch, paymentType]);

  const isFormValid = () => {
    if (paymentType === "creditCard") {
      return (
        paymentDetails.cardNumber &&
        paymentDetails.cvv &&
        paymentDetails.expirationDate &&
        paymentDetails.expirationDate.length === 5 &&
        paymentDetails.cardName &&
        !errors.cardNumber &&
        !errors.cvv &&
        !errors.expirationDate &&
        !errors.cardName
      );
    }
    return true;
  };
  

  React.useEffect(() => {
    onFormValidityChange(isFormValid());
  }, [paymentType, paymentDetails, errors, onFormValidityChange]);

  const handlePaymentTypeChange = (event) => {
    const selectedType = event.target.value;
    dispatch(setPaymentType(selectedType));
    setErrors({
      cardNumber: false,
      cvv: false,
      expirationDate: false,
      cardName: false,
    });
  };

  const handleCardNumberChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ");

    const isValidCardNumber = (number) => {
      if (number.length < 16) return false;
      if (number === "0000000000000000") return false;

      const firstDigit = number[0];
      return ["2", "3", "4", "5"].includes(firstDigit);
    };

    setErrors((prevErrors) => ({
      ...prevErrors,
      cardNumber: !isValidCardNumber(value),
    }));

    if (value.length <= 16) {
      dispatch(setPaymentDetails({ cardNumber: formattedValue }));
    }
  };

  const handleCvvChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");
    setErrors((prevErrors) => ({
      ...prevErrors,
      cvv: value.length < 3,
    }));
    if (value.length <= 3) {
      dispatch(setPaymentDetails({ cvv: value }));
    }
  };

  const handleExpirationDateChange = (event) => {
    const currentYear = new Date().getFullYear() % 100;
    let value = event.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);

    let formattedValue = value;
    if (value.length >= 2) {
      let month = parseInt(value.slice(0, 2), 10);
      if (month > 12) month = 12;
      if (month < 1) month = 1;
      formattedValue =
        month.toString().padStart(2, "0") +
        (value.length > 2 ? "/" + value.slice(2, 4) : "");
    }

    let yearValid = true;
    if (value.length === 4) {
      const year = parseInt(value.slice(2, 4), 10);
      yearValid = year >= currentYear;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      expirationDate:
        value.length === 4 &&
        (!yearValid ||
          parseInt(value.slice(0, 2), 10) > 12 ||
          parseInt(value.slice(0, 2), 10) < 1),
    }));

    if (value.length <= 4) {
      dispatch(setPaymentDetails({ expirationDate: formattedValue }));
    }
  };

  const handleCardNameChange = (event) => {
    const value = event.target.value;
    const validCharacters = /[a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g;
    const filteredValue = value.match(validCharacters)?.join("") || "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      cardName: value.trim() === "",
    }));

    dispatch(setPaymentDetails({ cardName: filteredValue }));
  };

  return (
    <Stack spacing={{ xs: 3, sm: 6 }} useFlexGap>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          aria-label="Payment options"
          name="paymentType"
          value={paymentType || "creditCard"}
          onChange={handlePaymentTypeChange}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Card selected={paymentType === "creditCard"}>
            <CardActionArea
              onClick={() => dispatch(setPaymentType("creditCard"))}
              sx={{
                ".MuiCardActionArea-focusHighlight": {
                  backgroundColor: "transparent",
                },
                "&:hover": {
                  backgroundColor: "transparent",
                },
                "&:focus-visible": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <CardContent
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <CreditCardRoundedIcon
                  fontSize="small"
                  sx={[
                    (theme) => ({
                      color: "grey.400",
                      ...theme.applyStyles("dark", {
                        color: "grey.600",
                      }),
                    }),
                    paymentType === "creditCard" && {
                      color: "primary.main",
                    },
                  ]}
                />
                <Typography sx={{ fontWeight: "medium" }}>Card</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card selected={paymentType === "bankTransfer"}>
            <CardActionArea
              onClick={() => dispatch(setPaymentType("bankTransfer"))}
              sx={{
                ".MuiCardActionArea-focusHighlight": {
                  backgroundColor: "transparent",
                },
                "&:hover": {
                  backgroundColor: "transparent",
                },

                "&:focus-visible": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <CardContent
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <AccountBalanceRoundedIcon
                  fontSize="small"
                  sx={[
                    (theme) => ({
                      color: "grey.400",
                      ...theme.applyStyles("dark", {
                        color: "grey.600",
                      }),
                    }),
                    paymentType === "bankTransfer" && {
                      color: "primary.main",
                    },
                  ]}
                />
                <Typography sx={{ fontWeight: "medium" }}>
                  Bank account
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </RadioGroup>
      </FormControl>
      {paymentType === "creditCard" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <PaymentContainer>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle2">Credit card</Typography>
              <CreditCardRoundedIcon sx={{ color: "text.secondary" }} />
            </Box>
            {getCardLogo(paymentDetails.cardNumber)}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                gap: 2,
              }}
            >
              <FormGrid sx={{ flexGrow: 1 }}>
                <FormLabel htmlFor="card-number" required>
                  Card number
                </FormLabel>
                <OutlinedInput
                  id="card-number"
                  autoComplete="card-number"
                  placeholder="0000 0000 0000 0000"
                  required
                  size="small"
                  value={paymentDetails.cardNumber || ""}
                  onChange={handleCardNumberChange}
                  error={errors.cardNumber}
                />
                {errors.cardNumber && (
                  <FormHelperText error>
                    Please enter a valid card number.
                  </FormHelperText>
                )}
              </FormGrid>
              <FormGrid sx={{ maxWidth: "20%" }}>
                <FormLabel htmlFor="cvv" required>
                  CVV
                </FormLabel>
                <OutlinedInput
                  id="cvv"
                  autoComplete="CVV"
                  placeholder="123"
                  required
                  size="small"
                  value={paymentDetails.cvv || ""}
                  onChange={handleCvvChange}
                  error={errors.cvv}
                />
                {errors.cvv && (
                  <FormHelperText error>
                    Please enter a valid CVV.
                  </FormHelperText>
                )}
              </FormGrid>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormGrid sx={{ flexGrow: 1 }}>
                <FormLabel htmlFor="card-name" required>
                  Name
                </FormLabel>
                <OutlinedInput
                  id="card-name"
                  autoComplete="card-name"
                  placeholder="John Smith"
                  required
                  size="small"
                  value={paymentDetails.cardName || ""}
                  onChange={handleCardNameChange}
                  error={errors.cardName}
                />
                {errors.cardName && (
                  <FormHelperText error>
                    Please enter the name on the card.
                  </FormHelperText>
                )}
              </FormGrid>
              <FormGrid sx={{ flexGrow: 1 }}>
                <FormLabel htmlFor="card-expiration" required>
                  Expiration date
                </FormLabel>
                <OutlinedInput
                  id="card-expiration"
                  autoComplete="card-expiration"
                  placeholder="MM/YY"
                  required
                  size="small"
                  value={paymentDetails.expirationDate || ""}
                  onChange={handleExpirationDateChange}
                  error={errors.expirationDate}
                />
                {errors.expirationDate && (
                  <FormHelperText error>
                    Please enter a valid expiration date.
                  </FormHelperText>
                )}
              </FormGrid>
            </Box>
          </PaymentContainer>
          <FormControlLabel
            control={<Checkbox name="saveCard" />}
            label="Remember credit card details for next time"
          />
        </Box>
      )}

      {paymentType === "bankTransfer" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Alert severity="warning" icon={<WarningRoundedIcon />}>
            Your order will be processed once we receive the funds.
          </Alert>
          <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
            Bank account
          </Typography>
          <Typography variant="body1" gutterBottom>
            Please transfer the payment to the bank account details shown below.
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Bank:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              Mastercredit
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Account number:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              123456789
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Routing number:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              987654321
            </Typography>
          </Box>
        </Box>
      )}
    </Stack>
  );
}
