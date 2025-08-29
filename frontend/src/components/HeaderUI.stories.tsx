import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import HeaderUI from './HeaderUI';
import { AuthUser } from '../auth/useAuth';

const meta: Meta<typeof HeaderUI> = {
  title: 'Components/HeaderUI',
  component: HeaderUI,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    onLogout: { action: 'logout clicked' },
    onLogin: { action: 'login clicked' },
    onToggleUserDropdown: { action: 'toggle dropdown clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof HeaderUI>;

const Template: Story = {
  render: (args) => <HeaderUI {...args} />,
};

export const NotAuthenticated: Story = {
  ...Template,
  args: {
    isAuthenticated: false,
    user: null,
    showUserDropdown: false,
    dropdownRef: { current: null },
    getUserInitials: () => '',
    onLogout: () => {},
    onLogin: () => {},
    onToggleUserDropdown: () => {},
  },
};

export const Authenticated: Story = {
  ...Template,
  args: {
    isAuthenticated: true,
    user: {
      name: 'John Doe',
      email: 'john.doe@example.com'
    } as AuthUser,
    showUserDropdown: false,
    dropdownRef: { current: null },
    getUserInitials: () => 'JD',
    onLogout: () => {},
    onLogin: () => {},
    onToggleUserDropdown: () => {},
  },
};

export const AuthenticatedWithDropdownOpen: Story = {
  ...Template,
  args: {
    isAuthenticated: true,
    user: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com'
    } as AuthUser,
    showUserDropdown: true,
    dropdownRef: { current: null },
    getUserInitials: () => 'JS',
    onLogout: () => {},
    onLogin: () => {},
    onToggleUserDropdown: () => {},
  },
};

export const AuthenticatedNoName: Story = {
  ...Template,
  args: {
    isAuthenticated: true,
    user: {
      email: 'user@example.com'
    } as AuthUser,
    showUserDropdown: false,
    dropdownRef: { current: null },
    getUserInitials: () => 'U',
    onLogout: () => {},
    onLogin: () => {},
    onToggleUserDropdown: () => {},
  },
};

export const AuthenticatedWithLongName: Story = {
  ...Template,
  args: {
    isAuthenticated: true,
    user: {
      name: 'Dr. Elizabeth Alexandra Windsor',
      email: 'queen@buckingham.palace.uk'
    } as AuthUser,
    showUserDropdown: false,
    dropdownRef: { current: null },
    getUserInitials: () => 'EW',
    onLogout: () => {},
    onLogin: () => {},
    onToggleUserDropdown: () => {},
  },
};
