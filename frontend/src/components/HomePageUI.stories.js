import React from 'react';
import HomePageUI from './HomePageUI';

export default {
  title: 'Components/HomePageUI',
  component: HomePageUI,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    isAuthenticated: {
      control: 'boolean',
      description: 'Whether the user is authenticated',
    },
  },
};

const Template = (args) => <HomePageUI {...args} />;

export const Default = Template.bind({});
Default.args = {
  isAuthenticated: false,
};

export const Authenticated = Template.bind({});
Authenticated.args = {
  isAuthenticated: true,
};
