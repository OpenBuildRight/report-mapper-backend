import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import HeaderUI from './HeaderUI';

export default {
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

const Template = (args) => <HeaderUI {...args} />;

export const NotAuthenticated = Template.bind({});
NotAuthenticated.args = {
  isAuthenticated: false,
  user: null,
  showUserDropdown: false,
  getUserInitials: () => '',
};

export const Authenticated = Template.bind({});
Authenticated.args = {
  isAuthenticated: true,
  user: {
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com'
    }
  },
  showUserDropdown: false,
  getUserInitials: () => 'JD',
};

export const AuthenticatedWithDropdownOpen = Template.bind({});
AuthenticatedWithDropdownOpen.args = {
  isAuthenticated: true,
  user: {
    profile: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com'
    }
  },
  showUserDropdown: true,
  getUserInitials: () => 'JS',
};

export const AuthenticatedNoName = Template.bind({});
AuthenticatedNoName.args = {
  isAuthenticated: true,
  user: {
    profile: {
      email: 'user@example.com'
    }
  },
  showUserDropdown: false,
  getUserInitials: () => 'U',
};

export const AuthenticatedWithLongName = Template.bind({});
AuthenticatedWithLongName.args = {
  isAuthenticated: true,
  user: {
    profile: {
      name: 'Dr. Elizabeth Alexandra Windsor',
      email: 'queen@buckingham.palace.uk'
    }
  },
  showUserDropdown: false,
  getUserInitials: () => 'EW',
};
