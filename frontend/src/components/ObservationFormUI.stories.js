import ObservationFormUI from './ObservationFormUI';

export default {
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

// Default story
export const Default = {
  args: {
    formData: {
      title: '',
      description: '',
      observationTime: '',
      latitude: '',
      longitude: '',
      imageIds: [],
      properties: {}
    },
    availableImages: [
      { id: 'demo-image-1', description: 'Demo Image 1' },
      { id: 'demo-image-2', description: 'Demo Image 2' }
    ],
    loading: false,
    message: null,
    propertyKey: '',
    propertyValue: ''
  }
};

// Story with pre-filled data
export const WithData = {
  args: {
    formData: {
      title: 'Broken Street Light',
      description: 'Street light is not working on the corner',
      observationTime: '2024-01-01T12:00',
      latitude: '40.7128',
      longitude: '-74.0060',
      imageIds: ['demo-image-1'],
      properties: { severity: 'high', type: 'infrastructure' }
    },
    availableImages: [
      { id: 'demo-image-1', description: 'Demo Image 1' },
      { id: 'demo-image-2', description: 'Demo Image 2' }
    ],
    loading: false,
    message: null,
    propertyKey: '',
    propertyValue: ''
  }
};

// Story with success message
export const WithSuccessMessage = {
  args: {
    formData: {
      title: '',
      description: '',
      observationTime: '',
      latitude: '',
      longitude: '',
      imageIds: [],
      properties: {}
    },
    availableImages: [
      { id: 'demo-image-1', description: 'Demo Image 1' },
      { id: 'demo-image-2', description: 'Demo Image 2' }
    ],
    loading: false,
    message: { type: 'success', text: 'Observation created successfully! ID: 123' },
    propertyKey: '',
    propertyValue: ''
  }
};

// Story with error message
export const WithErrorMessage = {
  args: {
    formData: {
      title: '',
      description: '',
      observationTime: '',
      latitude: '',
      longitude: '',
      imageIds: [],
      properties: {}
    },
    availableImages: [
      { id: 'demo-image-1', description: 'Demo Image 1' },
      { id: 'demo-image-2', description: 'Demo Image 2' }
    ],
    loading: false,
    message: { type: 'error', text: 'Failed to create observation. Please try again.' },
    propertyKey: '',
    propertyValue: ''
  }
};

// Story with loading state
export const Loading = {
  args: {
    formData: {
      title: 'Test Observation',
      description: 'This is a test observation',
      observationTime: '2024-01-01T12:00',
      latitude: '40.7128',
      longitude: '-74.0060',
      imageIds: ['demo-image-1'],
      properties: { severity: 'medium' }
    },
    availableImages: [
      { id: 'demo-image-1', description: 'Demo Image 1' },
      { id: 'demo-image-2', description: 'Demo Image 2' }
    ],
    loading: true,
    message: null,
    propertyKey: '',
    propertyValue: ''
  }
};
