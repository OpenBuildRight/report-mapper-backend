import React from 'react';
import Map from './Map';

export default {
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

const Template = (args) => <Map {...args} />;

export const Default = Template.bind({});
Default.args = {
  selectedLocation: null,
  onMapClick: (latlng) => console.log('Map clicked at:', latlng),
};

export const WithSelectedLocation = Template.bind({});
WithSelectedLocation.args = {
  selectedLocation: {
    lat: 51.505,
    lng: -0.09,
  },
  onMapClick: (latlng) => console.log('Map clicked at:', latlng),
};

export const WithCustomLocation = Template.bind({});
WithCustomLocation.args = {
  selectedLocation: {
    lat: 40.7128,
    lng: -74.0060,
  },
  onMapClick: (latlng) => console.log('Map clicked at:', latlng),
};

export const NoClickHandler = Template.bind({});
NoClickHandler.args = {
  selectedLocation: null,
  onMapClick: null,
};
