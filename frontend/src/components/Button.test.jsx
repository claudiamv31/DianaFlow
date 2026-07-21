import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  test('renders children and uses button type by default', () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  test('calls onClick when enabled', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Continue</Button>);

    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when disabled', async () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Continue
      </Button>
    );

    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(onClick).not.toHaveBeenCalled();
  });

  test('renders each supported visual variant distinctly', () => {
    const { rerender } = render(<Button variant="primary">Action</Button>);
    const button = screen.getByRole('button', { name: /action/i });

    expect(button).toHaveClass('bg-gradient-to-l');

    rerender(<Button variant="outline">Action</Button>);
    expect(button).toHaveClass('bg-transparent');

    rerender(<Button variant="secondary">Action</Button>);
    expect(button).toHaveClass('bg-surface-container-high');
  });
});
