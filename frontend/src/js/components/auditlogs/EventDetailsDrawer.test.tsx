// Copyright 2021 Northern.tech AS
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
import { vi } from 'vitest';

import EventDetailsDrawer from './EventDetailsDrawer';
import EventDetailsDrawerContentMap from './EventDetailsDrawerContentMap';
import EventDetailsFallbackComponent from './eventdetails/FallbackComponent';

describe('EventDetailsDrawer Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <EventDetailsDrawer
        eventItem={defaultState.organization.auditlog.events[0]}
        onClose={vi.fn}
        open={true}
        mapChangeToContent={EventDetailsDrawerContentMap}
        fallbackComponenet={EventDetailsFallbackComponent}
      />
    );
    const view = baseElement.getElementsByClassName('MuiDrawer-paper')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
