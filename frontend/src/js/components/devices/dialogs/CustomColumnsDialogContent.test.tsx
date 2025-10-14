// Copyright 2022 Northern.tech AS
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
import { render } from '@/testUtils';
import { undefineds } from '@northern.tech/testing/mockData';
import { vi } from 'vitest';

import { Content as ColumnCustomizationDialogContent } from './CustomColumnsDialogContent';

describe('ColumnCustomizationDialogContent Component', () => {
  it('renders correctly', async () => {
    const attributes = [
      { key: 'name', value: 'Name', scope: 'tags', category: 'tags', priority: 1 },
      { key: 'id', value: 'Device ID', scope: 'identity', category: 'identity', priority: 1 },
      { key: 'status', value: 'status', scope: 'identity', category: 'identity', priority: 1 },
      { key: 'mac', value: 'mac', scope: 'identity', category: 'identity', priority: 1 },
      { key: 'artifact_name', value: 'artifact_name', scope: 'inventory', category: 'inventory', priority: 2 }
    ];

    const rootfs = 'rootfs-image.version';
    const headers = [
      { title: 'mac', attribute: { name: 'mac', scope: 'identity' }, sortable: true, customize: vi.fn(), textRender: vi.fn() },
      {
        id: 'inventory-device_type',
        key: 'device_type',
        name: 'device_type',
        scope: 'inventory',
        title: 'Device type',
        attribute: { name: 'device_type', scope: 'inventory' },
        textRender: vi.fn()
      },
      {
        id: 'inventory-rootfs-image.version',
        key: rootfs,
        name: rootfs,
        scope: 'inventory',
        title: 'Current software',
        attribute: { name: rootfs, scope: 'inventory', alternative: 'artifact_name' },
        textRender: vi.fn()
      },
      {
        id: 'system-updated_ts',
        key: 'updated_ts',
        name: 'updated_ts',
        scope: 'system',
        title: 'Last check-in',
        attribute: { name: 'updated_ts', scope: 'system' },
        textRender: vi.fn()
      },
      { title: 'Status', attribute: { name: 'status', scope: 'identity' }, sortable: true, component: vi.fn(), textRender: vi.fn() }
    ];

    const { baseElement } = render(
      <ColumnCustomizationDialogContent
        attributes={attributes}
        columnHeaders={headers}
        idAttribute={{ attribute: 'mac', scope: 'identity' }}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        selectedAttributes={[attributes[0], attributes[1]]}
        setSelectedAttributes={vi.fn()}
      />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
