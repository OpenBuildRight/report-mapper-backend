import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ObservationFormUI from './ObservationFormUI';
import { FormData, Message } from '../hooks/useObservationForm';
import { Image } from '../services/observationService';

const meta: Meta<typeof ObservationFormUI> = {
  title: 'Components/ObservationFormUI',
  component: ObservationFormUI,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A pure presentational component for creating observations with location, images, and custom properties.'
      }
    }
  },
  argTypes: {
    onInputChange: { action: 'input changed' },
    onImageSelection: { action: 'image selected' },
    onAddProperty: { action: 'property added' },
    onRemoveProperty: { action: 'property removed' },
    onGetCurrentLocation: { action: 'get location clicked' },
    onSubmit: { action: 'submit clicked' },
    onClearMessage: { action: 'clear message clicked' },
    onPropertyKeyChange: { action: 'property key changed' },
    onPropertyValueChange: { action: 'property value changed' }
  }
};

export default meta;
type Story = StoryObj<typeof ObservationFormUI>;

const defaultImages: Image[] = [
  { id: 'demo-image-1', description: 'Demo Image 1', filename: 'demo1.jpg', url: 'url1', uploadedAt: '2023-01-01' },
  { id: 'demo-image-2', description: 'Demo Image 2', filename: 'demo2.jpg', url: 'url2', uploadedAt: '2023-01-02' }
];

const defaultHandlers = {
  onInputChange: () => {},
  onImageSelection: () => {},
  onFileSelect: () => {},
  onUploadImages: async () => {},
  onAddProperty: () => {},
  onRemoveProperty: () => {},
  onGetCurrentLocation: () => {},
  onSubmit: () => {},
  onClearMessage: () => {},
  onPropertyKeyChange: () => {},
  onPropertyValueChange: () => {},
};

// Default story
export const Default: Story = {
  args: {
    formData: {
      title: '',
      description: '',
      observationTime: '',
      latitude: '',
      longitude: '',
      imageIds: [],
      properties: {}
    } as FormData,
    availableImages: defaultImages,
    uploadedImages: [],
    uploading: false,
    loading: false,
    message: null,
    propertyKey: '',
    propertyValue: '',
    ...defaultHandlers
  }
};

// Story with pre-filled data
export const WithData: Story = {
  args: {
    formData: {
      title: 'Broken Street Light',
      description: 'Street light is not working on the corner',
      observationTime: '2024-01-01T12:00',
      latitude: '40.7128',
      longitude: '-74.0060',
      imageIds: ['demo-image-1'],
      properties: { severity: 'high', type: 'infrastructure' }
    } as FormData,
    availableImages: defaultImages,
    uploadedImages: [],
    uploading: false,
    loading: false,
    message: null,
    propertyKey: '',
    propertyValue: '',
    ...defaultHandlers
  }
};

// Story with success message
export const WithSuccessMessage: Story = {
  args: {
    formData: {
      title: '',
      description: '',
      observationTime: '',
      latitude: '',
      longitude: '',
      imageIds: [],
      properties: {}
    } as FormData,
    availableImages: defaultImages,
    uploadedImages: [],
    uploading: false,
    loading: false,
    message: { type: 'success', text: 'Observation created successfully! ID: 123' } as Message,
    propertyKey: '',
    propertyValue: '',
    ...defaultHandlers
  }
};

// Story with error message
export const WithErrorMessage: Story = {
  args: {
    formData: {
      title: '',
      description: '',
      observationTime: '',
      latitude: '',
      longitude: '',
      imageIds: [],
      properties: {}
    } as FormData,
    availableImages: defaultImages,
    uploadedImages: [],
    uploading: false,
    loading: false,
    message: { type: 'error', text: 'Failed to create observation. Please try again.' } as Message,
    propertyKey: '',
    propertyValue: '',
    ...defaultHandlers
  }
};

// Story with loading state
export const Loading: Story = {
  args: {
    formData: {
      title: 'Test Observation',
      description: 'This is a test observation',
      observationTime: '2024-01-01T12:00',
      latitude: '40.7128',
      longitude: '-74.0060',
      imageIds: ['demo-image-1'],
      properties: { severity: 'medium' }
    } as FormData,
    availableImages: defaultImages,
    uploadedImages: [],
    uploading: false,
    loading: true,
    message: null,
    propertyKey: '',
    propertyValue: '',
    ...defaultHandlers
  }
};
