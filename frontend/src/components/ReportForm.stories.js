import ReportForm from './ReportForm';

export default {
  title: 'Components/ReportForm',
  component: ReportForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A form component for submitting reports with location data.'
      }
    }
  },
  argTypes: {
    location: {
      control: 'object',
      description: 'Location coordinates for the report'
    },
    onSubmit: { 
      action: 'submitted',
      description: 'Callback when form is submitted'
    },
    onCancel: { 
      action: 'cancelled',
      description: 'Callback when form is cancelled'
    }
  }
};

// Default story
export const Default = {
  args: {
    location: {
      lat: 51.505,
      lng: -0.09
    }
  }
};

// Story with different location
export const DifferentLocation = {
  args: {
    location: {
      lat: 40.7128,
      lng: -74.0060
    }
  }
};

// Story for safety category
export const SafetyCategory = {
  args: {
    location: {
      lat: 51.505,
      lng: -0.09
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Form configured for safety-related reports.'
      }
    }
  }
};
