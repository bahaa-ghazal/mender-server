// Copyright 2019 Northern.tech AS
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
import { useLocation, useSearchParams } from 'react-router-dom';

import { defaultState, render } from '@/testUtils';
import { undefineds } from '@northern.tech/testing/mockData';
import { act, prettyDOM } from '@testing-library/react';
import { vi } from 'vitest';

import DeviceGroups from './DeviceGroups';

const preloadedState = {
  ...defaultState,
  devices: {
    ...defaultState.devices,
    groups: {
      ...defaultState.devices.groups,
      selectedGroup: 'testGroup'
    },
    deviceList: {
      ...defaultState.devices.deviceList,
      deviceIds: defaultState.devices.byStatus.accepted.deviceIds
    }
  }
};

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useLocation: vi.fn(),
    useSearchParams: vi.fn()
  };
});

describe('DeviceGroups Component', () => {
  const searchParams = `inventory=group:eq:${preloadedState.devices.groups.selectedGroup}`;
  it('renders correctly', async () => {
    const location = {
      pathname: '/ui/devices/accepted',
      search: `?${searchParams}`,
      hash: '',
      state: {},
      key: 'testKey'
    };
    const mockSearchParams = new URLSearchParams(searchParams);
    const setParams = vi.fn();

    // mock location and search params as DeviceGroups component pays attention to the url and parses state from it
    useLocation.mockImplementation(() => location);
    useSearchParams.mockReturnValue([mockSearchParams, setParams]);

    const { baseElement } = render(<DeviceGroups />, { preloadedState });
    // special snapshot handling here to work around unstable ids in mui code...
    const view = prettyDOM(baseElement.firstChild, 100000, { highlight: false })
      .replace(/(:?aria-labelledby|id)=":.*:"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
    await act(async () => vi.runAllTicks());
  });
});
