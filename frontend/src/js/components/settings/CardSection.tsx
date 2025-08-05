// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import { ReactNode, useState } from 'react';

import { Button } from '@mui/material';

import InfoText from '@northern.tech/common-ui/InfoText';
import Loader from '@northern.tech/common-ui/Loader';
import storeActions from '@northern.tech/store/actions';
import { Organization } from '@northern.tech/store/organizationSlice/types';
import { useAppDispatch } from '@northern.tech/store/store';
import { cancelUpgrade } from '@northern.tech/store/thunks';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

import stripeImage from '../../../assets/img/powered_by_stripe.png';

const { setSnackbar } = storeActions;

interface CardSectionProps {
  infoText?: string;
  isSignUp: boolean;
  isValid?: boolean;
  onCardConfirmed: () => void;
  onClose?: () => void;
  onSubmit: () => Promise<void>;
  organization: Organization;
  summary?: ReactNode | false;
}
export const CardSection = ({ isSignUp, onClose, organization, onSubmit, onCardConfirmed, isValid = true, infoText, summary }: CardSectionProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errors, setErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(true);
  const dispatch = useAppDispatch();
  const setSnackbarMessage = (message: string) => dispatch(setSnackbar(message));
  const onCancel = () => {
    dispatch(cancelUpgrade(organization.id));
    if (onClose) {
      onClose();
    }
  };

  const confirmCard = async secret => {
    // Use elements.getElement to get a reference to the mounted Element.
    const cardElement = elements.getElement(CardElement);

    // Use your card Element with other Stripe.js APIs
    try {
      const result = await stripe.confirmCardSetup(secret, {
        payment_method: {
          card: cardElement
        }
      });

      if (result.error) {
        setSnackbarMessage(`Error while confirming card: ${result.error.message}`);
        onCancel();
      } else {
        setSnackbarMessage(`Card confirmed. Updating your account...`);
        onCardConfirmed();
      }
    } catch (error) {
      console.error(error);
      setSnackbarMessage(`Something went wrong while submitting the form. Please contact support.`);
      onCancel();
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setLoading(true);
    return onSubmit()
      .then(confirmCard)
      .finally(() => setLoading(false));
  };

  const stripeElementChange = event => {
    setEmpty(false);
    if (event.complete) {
      // enable payment button
      setErrors(false);
    } else if (event.error) {
      // show validation to customer
      setErrors(true);
    }
  };

  return (
    <form className="margin-top-small" onSubmit={handleSubmit} onReset={onCancel}>
      <CardElement className="warning" onChange={stripeElementChange} />
      {!!errors && <p className="warning">There is an error in the form. Please check that your details are correct</p>}

      <div id="poweredByStripe">
        <div>All standard credit card fees apply (e.g. foreign transaction fee, if your card has one)</div>
        <img src={stripeImage} />
      </div>

      {isSignUp && <InfoText>{infoText ? infoText : 'Billing will be scheduled monthly, starting from today. You can cancel at any time.'}</InfoText>}
      {summary}
      <div className="flexbox center-aligned margin-top-small">
        <Button type="reset" disabled={loading} style={{ marginRight: 15 }} onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="secondary" type="submit" disabled={errors || loading || empty || !isValid}>
          {isSignUp ? 'Confirm Subscription' : 'Save'}
        </Button>
      </div>
      <Loader show={loading} />
    </form>
  );
};

export default CardSection;
