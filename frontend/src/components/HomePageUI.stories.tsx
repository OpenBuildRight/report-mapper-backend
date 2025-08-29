import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import HomePageUI from './HomePageUI';

const meta: Meta<typeof HomePageUI> = {
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

export default meta;
type Story = StoryObj<typeof HomePageUI>;

const Template: Story = {
  render: (args) => <HomePageUI {...args} />,
};

export const Default: Story = {
  ...Template,
  args: {
    isAuthenticated: false,
  },
};

export const Authenticated: Story = {
  ...Template,
  args: {
    isAuthenticated: true,
  },
};
