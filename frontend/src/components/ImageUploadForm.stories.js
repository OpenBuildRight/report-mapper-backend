import ImageUploadForm from './ImageUploadForm';

export default {
  title: 'Components/ImageUploadForm',
  component: ImageUploadForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A form component for uploading images with location and metadata.'
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
        story: 'Form with instructions for users on how to upload images.'
      }
    }
  }
};
