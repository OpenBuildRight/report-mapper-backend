import ObservationForm from './ObservationForm';

export default {
  title: 'Components/ObservationForm',
  component: ObservationForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A form component for submitting observations with location data.'
      }
    }
  }
};

// Default story
export const Default = {
  args: {}
};

// Story with instructions
export const WithInstructions = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Form with instructions for users on how to create observations.'
      }
    }
  }
};
