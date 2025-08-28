import ReportFormUI from './ReportFormUI';

export default {
  title: 'Components/ReportFormUI',
  component: ReportFormUI,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A pure presentational component for submitting reports with location data.'
      }
    }
  },
  argTypes: {
    onInputChange: { action: 'input changed' },
    onSubmit: { action: 'submit clicked' },
    onCancel: { action: 'cancel clicked' },
    onClearMessage: { action: 'clear message clicked' }
  }
};

// Default story
export const Default = {
  args: {
    formData: {
      title: '',
      description: '',
      category: 'general',
      priority: 'medium'
    },
    submitting: false,
    message: null,
    location: {
      lat: 51.505,
      lng: -0.09
    }
  }
};

// Story with pre-filled data
export const WithData = {
  args: {
    formData: {
      title: 'Broken Street Light',
      description: 'Street light is not working on the corner',
      category: 'infrastructure',
      priority: 'high'
    },
    submitting: false,
    message: null,
    location: {
      lat: 40.7128,
      lng: -74.0060
    }
  }
};

// Story with success message
export const WithSuccessMessage = {
  args: {
    formData: {
      title: '',
      description: '',
      category: 'general',
      priority: 'medium'
    },
    submitting: false,
    message: { type: 'success', text: 'Report submitted successfully!' },
    location: {
      lat: 51.505,
      lng: -0.09
    }
  }
};

// Story with error message
export const WithErrorMessage = {
  args: {
    formData: {
      title: '',
      description: '',
      category: 'general',
      priority: 'medium'
    },
    submitting: false,
    message: { type: 'error', text: 'Failed to submit report. Please try again.' },
    location: {
      lat: 51.505,
      lng: -0.09
    }
  }
};

// Story with submitting state
export const Submitting = {
  args: {
    formData: {
      title: 'Test Report',
      description: 'This is a test report',
      category: 'safety',
      priority: 'urgent'
    },
    submitting: true,
    message: null,
    location: {
      lat: 51.505,
      lng: -0.09
    }
  }
};
