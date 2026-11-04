import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './pagination';

const items = Array.from({ length: 25 }, (_, i) => ({ name: `Item ${i}` }));

describe('Pagination', () => {
  it('renders one button per page and marks the current page', () => {
    render(<Pagination items={items} resultsPerPage={10} currentPage={2} changeResultPage={() => {}} />);
    expect(screen.getAllByRole('button', { name: /^\d+$/ })).toHaveLength(3);
    expect(screen.getByRole('button', { name: '2' }).parentElement).toHaveClass('active');
  });

  it('changes page from the number buttons and the arrows', async () => {
    const change = vi.fn();
    render(<Pagination items={items} resultsPerPage={10} currentPage={2} changeResultPage={change} />);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    await userEvent.click(screen.getByRole('button', { name: 'previous icon' }));
    await userEvent.click(screen.getByRole('button', { name: 'next icon' }));
    expect(change.mock.calls).toEqual([[3], [1], [3]]);
  });

  it('disables the arrows at the first and last page', () => {
    const { rerender } = render(<Pagination items={items} resultsPerPage={10} currentPage={1} changeResultPage={() => {}} />);
    expect(screen.getByRole('button', { name: 'previous icon' })).toBeDisabled();
    rerender(<Pagination items={items} resultsPerPage={10} currentPage={3} changeResultPage={() => {}} />);
    expect(screen.getByRole('button', { name: 'next icon' })).toBeDisabled();
  });
});
