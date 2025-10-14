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
import { Provider } from 'react-redux';

import { defaultState, render } from '@/testUtils';
import { undefineds } from '@northern.tech/testing/mockData';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { vi } from 'vitest';

import ConfigImportDialog from './ConfigImportDialog';

const mockStore = configureStore([thunk]);

let store;

describe('ConfigImportDialog Component', () => {
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <ConfigImportDialog onSubmit={vi.fn} onCancel={vi.fn} setSnackbar={vi.fn} />
      </Provider>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const submitMock = vi.fn();
    const menderFile = new File(['testContent plain'], 'test.pem');

    const ui = (
      <Provider store={store}>
        <ConfigImportDialog onSubmit={submitMock} onCancel={vi.fn} setSnackbar={vi.fn} />
      </Provider>
    );
    const { rerender } = render(ui);
    expect(screen.getByText(/the current default/i)).toBeInTheDocument();
    await user.click(screen.getByText(/the current default/i));
    await user.click(screen.getByRole('button', { name: 'Import' }));
    expect(submitMock).toHaveBeenCalledWith({ importType: 'default', config: null });

    // container.querySelector doesn't work in this scenario for some reason -> but querying document seems to work
    const uploadInput = document.querySelector('.dropzone input');
    await user.upload(uploadInput, menderFile);
    await waitFor(() => rerender(ui));
    expect(uploadInput.files).toHaveLength(1);
  });
});
