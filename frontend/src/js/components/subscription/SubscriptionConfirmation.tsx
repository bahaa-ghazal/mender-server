// Copyright 2025 Northern.tech AS
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
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { TaskAlt as TaskAltIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Button, DialogContent, IconButton, Typography } from '@mui/material';

import { BaseDialog } from '@northern.tech/common-ui/dialogs/BaseDialog';
import { cleanUp } from '@northern.tech/store/auth';
import { ADDONS, AvailableAddon, Plan } from '@northern.tech/store/constants';
import { getOrganization } from '@northern.tech/store/organizationSlice/selectors';

import { formatPrice } from './utils';

interface SubscriptionConfirmationProps {
  devices: number;
  orderedAddons: { name: AvailableAddon }[];
  plan: Plan;
  price: number;
}
export const SubscriptionConfirmation = (props: SubscriptionConfirmationProps) => {
  const { plan, devices, price, orderedAddons } = props;
  const { addons: enabledAddons, plan: currentPlan } = useSelector(getOrganization);

  const [addonList] = useState(orderedAddons.map(addon => addon.name));

  const previousAddonsList = enabledAddons.filter(addon => addon.enabled);
  const willLogout = addonList.length > previousAddonsList.length || currentPlan !== plan.id;
  const [count, setCount] = useState<number>(60);
  const logOut = () => {
    cleanUp();
    window.location.replace('/ui/');
  };

  useEffect(() => {
    if (!willLogout) {
      return;
    }
    const timer = setInterval(() => {
      setCount(prevCount => {
        if (prevCount === 1) {
          clearInterval(timer);
          logOut();
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [willLogout]);

  return (
    <BaseDialog
      open
      maxWidth="xs"
      title={
        <div className="flexbox center-aligned">
          <IconButton size="large">
            <TaskAltIcon selected className="green" />
          </IconButton>
          <Typography variant="h6">Payment successful!</Typography>
        </div>
      }
    >
      <DialogContent>
        <Typography variant="body1">
          {willLogout
            ? `Your subscription has been successfully updated${currentPlan !== plan.id ? ` to Mender ${plan.name}.` : '.'}`
            : 'Your device limit has been successfully updated.'}
        </Typography>
        <div className="margin-top-small margin-bottom-small">
          <Typography variant="subtitle1"> Subscription details: </Typography>
          <Typography> Plan: {plan.name} </Typography>
          <Typography> Devices: {devices} </Typography>
          {addonList.length > 0 && <Typography>Add-ons: {addonList.map(addon => ADDONS[addon].title).join(', ')}</Typography>}
          <Typography>Monthly cost: {formatPrice(price)}</Typography>
        </div>
        {willLogout ? (
          <Alert severity="info" icon={false}>
            <AlertTitle textAlign="center">Automatic logout in {count} seconds</AlertTitle>
            <div className="flexbox column centered">
              <Typography className="margin-bottom-x-small" textAlign="center" variant="body2">
                You will be logged out automatically, for your new subscription to take effect.
              </Typography>
              <Button variant="contained" onClick={logOut}>
                Log out now
              </Button>
            </div>
          </Alert>
        ) : (
          <Alert
            severity="success"
            icon={false}
            sx={{
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
            className="flexbox space-between"
          >
            <AlertTitle textAlign="center">Subscription Active</AlertTitle>
            <div className="flexbox column centered">
              <Typography className="margin-bottom-x-small" textAlign="center" variant="body2">
                Your updated subscription is ready to use.{' '}
              </Typography>
              <Button variant="outlined" onClick={() => window.location.replace('/ui/')}>
                Close
              </Button>
            </div>
          </Alert>
        )}
      </DialogContent>
    </BaseDialog>
  );
};
