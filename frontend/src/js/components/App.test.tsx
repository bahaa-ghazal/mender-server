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
import Linkify from 'react-linkify';

import { defaultState, render } from '@/testUtils';
import GeneralApi from '@northern.tech/store/api/general-api';
import { getSessionInfo } from '@northern.tech/store/auth';
import { TIMEOUTS, maxSessionAge } from '@northern.tech/store/constants';
import { mockDate, token, undefineds } from '@northern.tech/testing/mockData';
import { act, screen, render as testLibRender, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'jsdom-worker';
import { vi } from 'vitest';

import App, { AppProviders } from './App';

const preloadedState = {
  ...defaultState,
  app: {
    ...defaultState.app,
    trackerCode: 'testtracker',
    versionInformation: {
      Integration: 'next'
    }
  },
  deployments: {
    ...defaultState.deployments,
    byId: {},
    byStatus: {
      ...defaultState.deployments.byStatus,
      inprogress: {
        ...defaultState.deployments.byStatus.inprogress,
        total: 0
      }
    },
    deploymentDeviceLimit: null
  }
};

vi.mock('react-linkify');

describe('App Component', () => {
  beforeAll(() => {
    Linkify.default = vi.fn();
    Linkify.default.mockReturnValue(null);
  });
  it(
    'renders correctly',
    async () => {
      vi.spyOn(window.mender_environment, 'integrationVersion', 'get').mockImplementation(() => 'next');
      // vi.replaceProperty(window.mender_environment, 'integrationVersion', 'next');

      const ui = <App />;
      const { asFragment, rerender } = render(ui, {
        preloadedState: { ...preloadedState, users: { ...preloadedState.users, currentSession: getSessionInfo() } }
      });
      await waitFor(() => expect(screen.queryByText(/see all deployments/i)).toBeInTheDocument(), { timeout: TIMEOUTS.threeSeconds });
      await waitFor(() => rerender(ui));
      const view = asFragment().querySelector('#app');
      await waitFor(() => expect(document.querySelector('.loaderContainer')).not.toBeInTheDocument());
      await act(async () => {
        vi.runOnlyPendingTimers();
        vi.runAllTicks();
      });
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    },
    10 * TIMEOUTS.oneSecond
  );

  it(
    'works as intended',
    async () => {
      const currentSession = { expiresAt: new Date().toISOString(), token };
      window.localStorage.getItem.mockImplementation(name => (name === 'JWT' ? JSON.stringify(currentSession) : undefined));

      const ui = <App />;
      const { rerender } = render(ui, {
        preloadedState: { ...preloadedState, users: { ...preloadedState.users, currentSession, currentUser: 'a1' } }
      });
      await act(async () => {
        vi.advanceTimersByTime(maxSessionAge * 1000 + 500);
        vi.runAllTicks();
        vi.runOnlyPendingTimers();
      });
      await waitFor(() => rerender(ui));
      await waitFor(() => expect(screen.queryByText(/Version:/i)).not.toBeInTheDocument(), { timeout: TIMEOUTS.fiveSeconds });
      expect(screen.queryByText(/Northern.tech/i)).toBeInTheDocument();
      expect(screen.queryByText(`© ${mockDate.getFullYear()} Northern.tech`)).toBeInTheDocument();
      await act(async () => {
        vi.runOnlyPendingTimers();
        vi.runAllTicks();
      });
      window.localStorage.getItem.mockRestore();
    },
    20 * TIMEOUTS.oneSecond
  );

  it(
    'is embedded in working providers',
    async () => {
      const ui = <AppProviders basename="" />;
      const { baseElement, rerender } = testLibRender(ui);
      await waitFor(() => screen.queryByText('Software distribution'), { timeout: TIMEOUTS.fiveSeconds });
      await waitFor(() => rerender(ui));
      await waitFor(() => expect(document.querySelector('.loaderContainer')).not.toBeInTheDocument());
      const view = baseElement.lastElementChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    },
    10 * TIMEOUTS.oneSecond
  );
  it(
    'allows offline threshold migration',
    async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const ui = <App />;
      render(ui, {
        preloadedState: {
          ...preloadedState,
          users: {
            ...preloadedState.users,
            currentSession: getSessionInfo(),
            settingsInitialized: false,
            globalSettings: {
              ...preloadedState.users.globalSettings,
              offlineThreshold: { interval: 15, intervalUnit: 'minutes' }
            }
          }
        }
      });
      await act(async () => {
        vi.advanceTimersByTime(TIMEOUTS.fiveSeconds);
        vi.runAllTicks();
      });
      await waitFor(() => expect(screen.queryByText(/granular device connectivity/i)).toBeInTheDocument(), { timeout: TIMEOUTS.fiveSeconds * 2 });
      const post = vi.spyOn(GeneralApi, 'post');
      await user.click(screen.getByRole('button', { name: /close/i }));
      await act(async () => {
        vi.runOnlyPendingTimers();
        vi.runAllTicks();
      });
      expect(post).toHaveBeenCalledWith(
        '/api/management/v1/useradm/settings',
        {
          '2fa': 'enabled',
          id_attribute: { attribute: 'mac', scope: 'identity' },
          previousFilters: [],
          offlineThreshold: { interval: 1, intervalUnit: 'days' }
        },
        { headers: {} }
      );
    },
    15 * TIMEOUTS.oneSecond
  );
});
