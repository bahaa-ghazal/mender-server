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
import { defaultState, render } from '@/testUtils';
import { initialState as initialOrganizationState } from '@northern.tech/store/organizationSlice';
import { undefineds } from '@northern.tech/testing/mockData';

import { TenantList } from './TenantList';

const state = {
  ...defaultState,
  organization: {
    ...defaultState.organization,
    tenantList: {
      ...initialOrganizationState.tenantList,
      tenants: [
        {
          id: '671a0f1dd58c813118fe8622',
          parent_tenant_id: '6718de64b42e08dea2a2065d',
          name: 'child2',
          tenant_token: 'mQDYRCr-tGbDuJhPp7fArbfTA5htVTWE9G204AzhDUM',
          status: 'active',
          additional_info: {
            marketing: false,
            campaign: ''
          },
          plan: 'enterprise',
          trial: false,
          trial_expiration: null,
          service_provider: false,
          created_at: '2024-10-24T09:10:53.281Z',
          cancelled_at: null,
          children_tenants: null,
          max_child_tenants: 0,
          device_count: 0,
          device_limit: 100,
          binary_delta: true
        },
        {
          id: '671a0f1dd58c813118fe8623',
          parent_tenant_id: '6718de64b42e08dea2a2065a',
          name: 'child3',
          tenant_token: 'mQDYRCr-tGbDuJhPp7fArbfTA5htVTWE9G203AzhDUM',
          status: 'active',
          additional_info: {
            marketing: false,
            campaign: ''
          },
          plan: 'enterprise',
          trial: false,
          trial_expiration: null,
          service_provider: false,
          created_at: '2024-10-24T10:12:54.226Z',
          cancelled_at: null,
          children_tenants: null,
          max_child_tenants: 0,
          device_count: 0,
          device_limit: 20,
          binary_delta: true
        }
      ]
    },
    organization: {
      ...defaultState.organization.organization,
      device_count: 20,
      device_limit: 200
    }
  }
};

describe('TenantList', () => {
  it('renders correctly', () => {
    const { baseElement } = render(<TenantList />, {
      preloadedState: state
    });
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
