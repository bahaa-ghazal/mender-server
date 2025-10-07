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
import { useCallback, useState } from 'react';

import { TextField } from '@mui/material';

import { ControlledAutoComplete } from '@northern.tech/common-ui/forms/Autocomplete';
import ClickFilter from '@northern.tech/common-ui/forms/ClickFilter';
import Filters from '@northern.tech/common-ui/forms/Filters';
import TimeframePicker from '@northern.tech/common-ui/forms/TimeframePicker';
import { getISOStringBoundaries } from '@northern.tech/utils/helpers';

const detailsMap = {
  Deployment: 'to device group',
  User: 'email'
};

const getOptionLabel = option => option.title ?? option.email ?? option;

const renderOption = (props, option) => {
  const { key, ...rest } = props;
  return (
    <li key={key} {...rest}>
      {getOptionLabel(option)}
    </li>
  );
};
const isUserOptionEqualToValue = ({ email, id }, value) => id === value || email === value || email === value?.email;

const autoSelectProps = {
  autoSelect: true,
  filterSelectedOptions: true,
  getOptionLabel,
  handleHomeEndKeys: true,
  renderOption
};

const LOG_RETENTION_PERIOD = 90;

export const AuditLogsFilter = ({
  groups,
  users,
  selectionState,
  disabled,
  isHosted,
  onFiltersChange,
  detailsReset,
  auditLogsTypes,
  dirtyField,
  setDirtyField
}) => {
  const { detail, endDate, user, startDate, type } = selectionState;
  const [date] = useState(getISOStringBoundaries(new Date()));
  const { start: today, end: tonight } = date;

  const typeOptionsMap = {
    Deployment: groups,
    User: Object.values(users)
  };
  const detailOptions = typeOptionsMap[type?.title] ?? [];

  const shouldShowRetentionText = useCallback(
    ({ startDate }) => {
      const cutOffDate = new Date();
      cutOffDate.setDate(cutOffDate.getDate() - LOG_RETENTION_PERIOD);
      const then = cutOffDate.toISOString().replace('Z', '');
      return isHosted && startDate < then;
    },
    [isHosted]
  );

  return (
    <ClickFilter disabled={disabled}>
      <Filters
        initialValues={{ startDate, endDate, user, type, detail }}
        defaultValues={{ startDate: today, endDate: tonight, user: '', type: null, detail: '' }}
        fieldResetTrigger={detailsReset}
        dirtyField={dirtyField}
        clearDirty={setDirtyField}
        filters={[
          {
            key: 'user',
            title: 'Performed by',
            Component: ControlledAutoComplete,
            componentProps: {
              ...autoSelectProps,
              freeSolo: true,
              isOptionEqualToValue: isUserOptionEqualToValue,
              options: Object.values(users),
              renderInput: params => <TextField {...params} placeholder="Select a user" InputProps={{ ...params.InputProps }} />
            }
          },
          {
            key: 'type',
            title: 'Filter by changes',
            Component: ControlledAutoComplete,
            componentProps: {
              ...autoSelectProps,
              options: auditLogsTypes,
              isOptionEqualToValue: (option, value) => option.value === value.value && option.object_type === value.object_type,
              renderInput: params => <TextField {...params} placeholder="Type" InputProps={{ ...params.InputProps }} />
            }
          },
          {
            key: 'detail',
            title: '',
            Component: ControlledAutoComplete,
            componentProps: {
              ...autoSelectProps,
              freeSolo: true,
              options: detailOptions,
              disabled: !type,
              renderInput: params => <TextField {...params} placeholder={detailsMap[type] || '-'} InputProps={{ ...params.InputProps }} />
            }
          },
          {
            key: 'timeframe',
            title: 'Start time',
            Component: TimeframePicker,
            componentProps: {
              tonight,
              helperText: 'Audit logs are retained for a limited period of time, which means that older events might not be shown.',
              hasHelperText: shouldShowRetentionText
            }
          }
        ]}
        onChange={onFiltersChange}
      />
    </ClickFilter>
  );
};

export default AuditLogsFilter;
