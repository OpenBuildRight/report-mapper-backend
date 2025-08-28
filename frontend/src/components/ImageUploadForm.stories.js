import ImageUploadFormUI from './ImageUploadFormUI';

export default {
  title: 'Components/ImageUploadFormUI',
  component: ImageUploadFormUI,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A pure presentational component for uploading images with location and metadata.'
      }
    }
  },
  argTypes: {
    onInputChange: { action: 'input changed' },
    onFileSelect: { action: 'files selected' },
    onGetCurrentLocation: { action: 'get location clicked' },
    onUpload: { action: 'upload clicked' },
    onClearMessage: { action: 'clear message clicked' }
  }
};

// Default story
export const Default = {
  args: {
    uploadedImages: [],
    uploading: false,
    message: null,
    formData: {
      latitude: '',
      longitude: '',
      description: '',
      imageGeneratedTime: ''
    }
  }
};

// Story with selected files
export const WithSelectedFiles = {
  args: {
    uploadedImages: [
      new File([''], 'test-image-1.jpg', { type: 'image/jpeg' }),
      new File([''], 'test-image-2.png', { type: 'image/png' })
    ],
    uploading: false,
    message: null,
    formData: {
      latitude: '40.7128',
      longitude: '-74.0060',
      description: 'Test description',
      imageGeneratedTime: '2024-01-01T12:00'
    }
  }
};

// Story with success message
export const WithSuccessMessage = {
  args: {
    uploadedImages: [],
    uploading: false,
    message: { type: 'success', text: 'Successfully uploaded 2 image(s)!' },
    formData: {
      latitude: '',
      longitude: '',
      description: '',
      imageGeneratedTime: ''
    }
  }
};

// Story with error message
export const WithErrorMessage = {
  args: {
    uploadedImages: [],
    uploading: false,
    message: { type: 'error', text: 'Failed to upload images. Please try again.' },
    formData: {
      latitude: '',
      longitude: '',
      description: '',
      imageGeneratedTime: ''
    }
  }
};

// Story with uploading state
export const Uploading = {
  args: {
    uploadedImages: [
      new File([''], 'test-image.jpg', { type: 'image/jpeg' })
    ],
    uploading: true,
    message: null,
    formData: {
      latitude: '40.7128',
      longitude: '-74.0060',
      description: 'Test description',
      imageGeneratedTime: ''
    }
  }
};
