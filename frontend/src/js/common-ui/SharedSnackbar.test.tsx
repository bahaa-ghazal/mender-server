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
import { render } from '@/testUtils';
import { yes } from '@northern.tech/store/constants';
import { undefineds } from '@northern.tech/testing/mockData';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import SharedSnackbar from './SharedSnackbar';

describe('SharedSnackbar Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<SharedSnackbar snackbar={{ open: true, message: 'test' }} setSnackbar={vi.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const actionCheck = vi.fn();
    const copyCheck = vi.fn(yes);
    document.execCommand = copyCheck;

    render(<SharedSnackbar snackbar={{ open: true, message: 'test' }} setSnackbar={actionCheck} />);
    expect(screen.queryByText(/test/i)).toBeInTheDocument();
    await user.click(screen.getByText(/test/i));
    expect(actionCheck).toHaveBeenCalled();
    expect(copyCheck).toHaveBeenCalled();
  });

  it('works as intended with a click listener', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const actionCheck = vi.fn();
    const copyCheck = vi.fn(yes);
    document.execCommand = copyCheck;

    render(<SharedSnackbar snackbar={{ open: true, message: 'test', preventClickToCopy: true }} setSnackbar={actionCheck} />);
    await user.click(screen.getByText(/test/i));
    expect(actionCheck).not.toHaveBeenCalled();
    expect(copyCheck).not.toHaveBeenCalled();
  });
});
