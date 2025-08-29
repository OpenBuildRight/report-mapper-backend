import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Map from './Map';
import { LatLng } from 'leaflet';

const meta: Meta<typeof Map> = {
  title: 'Components/Map',
  component: Map,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onMapClick: { action: 'map clicked' },
    selectedLocation: {
      control: 'object',
      description: 'Selected location coordinates',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Map>;

const Template: Story = {
  render: (args) => <Map {...args} />,
};

export const Default: Story = {
  ...Template,
  args: {
    selectedLocation: null,
    onMapClick: (latlng: LatLng) => console.log('Map clicked at:', latlng),
  },
};

export const WithSelectedLocation: Story = {
  ...Template,
  args: {
    selectedLocation: {
      lat: 51.505,
      lng: -0.09,
    },
    onMapClick: (latlng: LatLng) => console.log('Map clicked at:', latlng),
  },
};

export const WithCustomLocation: Story = {
  ...Template,
  args: {
    selectedLocation: {
      lat: 40.7128,
      lng: -74.0060,
    },
    onMapClick: (latlng: LatLng) => console.log('Map clicked at:', latlng),
  },
};

export const NoClickHandler: Story = {
  ...Template,
  args: {
    selectedLocation: null,
    onMapClick: null,
  },
};
