import { fireEvent, render, screen } from '@testing-library/react-native';
import { PasswordInput } from '@/components/inputs/PasswordInput';

describe('PasswordInput', () => {
  it('renders secure password input by default', () => {
    render(<PasswordInput label="Password" value="secret" onChangeText={jest.fn()} />);
    const input = screen.getByLabelText('Password');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('toggles password visibility', () => {
    render(<PasswordInput label="Password" value="secret" onChangeText={jest.fn()} />);
    fireEvent.press(screen.getByLabelText('Show password'));
    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(false);
  });

  it('does not render password value in helper text', () => {
    render(<PasswordInput label="Password" value="secret" onChangeText={jest.fn()} />);
    expect(screen.queryByText('secret')).toBeNull();
  });
});
