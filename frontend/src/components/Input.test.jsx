import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  test('renders its label and forwards input edits', async () => {
    const onChange = jest.fn();

    render(
      <Input
        label="Email"
        type="email"
        value=""
        onChange={onChange}
        placeholder="name@example.com"
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('name@example.com');
    await userEvent.type(input, 'a');

    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'name@example.com');
    expect(onChange).toHaveBeenCalled();
  });

  test('renders an optional icon beside the input', () => {
    render(<Input label="Name" icon={<span>person</span>} value="" />);

    expect(screen.getByText('person')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
