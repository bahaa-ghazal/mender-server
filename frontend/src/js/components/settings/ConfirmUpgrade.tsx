// Copyright 2024 Northern.tech AS
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
import { Button, DialogActions, DialogContent } from '@mui/material';

import { BaseDialog } from '@northern.tech/common-ui/dialogs/BaseDialog';
import { ADDONS, Plan } from '@northern.tech/store/constants';

interface ConfirmUpgradeProps {
  addOns: { name: string }[];
  currentPlan: Plan;
  newPlan: Plan;
  onClose: () => void;
  onConfirm: () => void;
}
export const ConfirmUpgrade = (props: ConfirmUpgradeProps) => {
  const { onConfirm, onClose, newPlan, currentPlan, addOns } = props;
  return (
    <BaseDialog title={`Upgrade your plan to ${newPlan.name}`} open={!!newPlan} onClose={onClose}>
      <DialogContent>
        <div className="margin-bottom-small">
          You are currently subscribed to the <b>Mender {currentPlan.name}</b> plan.
        </div>
        <div className="margin-bottom-small">
          Confirm to upgrade to <b>Mender {newPlan.name}</b>, billed at {newPlan.price}. <br />
          {addOns.map(addon => (
            <div key={addon.name}>
              The price of your <b>Mender {addon.name}</b> add-on package will change to {ADDONS[addon.name][newPlan.id].price}
            </div>
          ))}
        </div>
        <div>
          See full details of features and pricing at{' '}
          <a href="https://mender.io/plans/pricing" target="_blank" rel="noreferrer">
            mender.io/plans/pricing.
          </a>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="secondary" variant="contained" onClick={onConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </BaseDialog>
  );
};
