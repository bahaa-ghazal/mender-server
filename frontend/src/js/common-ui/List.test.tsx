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
import { CommonList } from '@northern.tech/common-ui/List';
import { tenants, undefineds } from '@northern.tech/testing/mockData';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { TenantListItem, columnHeaders } from '../components/tenants/TenantList';

describe('List component', () => {
  it('renders correctly', () => {
    const onExpandClickMock = vi.fn();
    const onResizeColumns = vi.fn();
    const onPageChange = vi.fn();
    const onSelect = vi.fn();
    const onSort = vi.fn();
    const onChangeRowsPerPage = vi.fn();
    const { baseElement } = render(
      <CommonList
        ListItemComponent={TenantListItem}
        listItems={tenants}
        listState={{ ...defaultState.organization.organization.tenantList, total: 10 }}
        columnHeaders={columnHeaders}
        onExpandClick={onExpandClickMock}
        onChangeRowsPerPage={onChangeRowsPerPage}
        onPageChange={onPageChange}
        onResizeColumns={onResizeColumns}
        onSelect={onSelect}
        onSort={onSort}
        pageLoading={false}
      />
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
  it('works as expected', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onExpandClickMock = vi.fn();
    const onResizeColumns = vi.fn();
    const onPageChange = vi.fn();
    const onSelect = vi.fn();
    const onSort = vi.fn();
    const onChangeRowsPerPage = vi.fn();
    render(
      <CommonList
        ListItemComponent={TenantListItem}
        listItems={tenants}
        listState={{ ...defaultState.organization.organization.tenantList, total: 10 }}
        columnHeaders={columnHeaders}
        onExpandClick={onExpandClickMock}
        onChangeRowsPerPage={onChangeRowsPerPage}
        onPageChange={onPageChange}
        onResizeColumns={onResizeColumns}
        onSelect={onSelect}
        onSort={onSort}
        pageLoading={false}
      />
    );

    await user.click(screen.getByText('View details'));
    expect(onExpandClickMock).toHaveBeenCalled();
  });
});
