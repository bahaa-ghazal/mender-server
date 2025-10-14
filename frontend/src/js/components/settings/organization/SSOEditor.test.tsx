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
import { SSO_TYPES } from '@northern.tech/store/constants';
import { undefineds } from '@northern.tech/testing/mockData';
import { vi } from 'vitest';

import SSOEditor from './SSOEditor';

describe('SSOEditor Component', () => {
  it('renders correctly', async () => {
    const config = '<div>not quite right</div>';
    const { baseElement } = render(
      <SSOEditor
        ssoItem={SSO_TYPES.saml}
        config={config}
        onCancel={vi.fn}
        onSave={vi.fn}
        fileContent={config}
        hasSSOConfig={true}
        open
        onClose={vi.fn}
        setFileContent={vi.fn}
      />
    );
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
