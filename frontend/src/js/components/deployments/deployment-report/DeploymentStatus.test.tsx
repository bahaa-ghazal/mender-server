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
import { defaultState, render } from '@/testUtils';
import { undefineds } from '@northern.tech/testing/mockData';

import DeploymentStatus, { DeploymentPhaseNotification } from './DeploymentStatus';

describe('DeploymentStatus Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeploymentStatus deployment={defaultState.deployments.byId.d2} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});

describe('DeploymentPhaseNotification Component', () => {
  const deployment = {
    ...defaultState.deployments.byId.d1,
    statistics: {
      ...defaultState.deployments.byId.d1.statistics,
      status: {
        ...defaultState.deployments.byId.d1.statistics.status,
        pause_before_committing: 0,
        pause_before_installing: 0,
        pause_before_rebooting: 1
      }
    }
  };
  it('renders correctly', async () => {
    const { baseElement } = render(<DeploymentPhaseNotification deployment={deployment} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
