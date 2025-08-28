import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ObservationFormUI from './ObservationFormUI';

// Mock the Map component
jest.mock('./Map', () => {
  return function MockMap() {
    return <div data-testid="map">Map Component</div>;
  };
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

describe('ObservationFormUI', () => {
  const defaultProps = {
    formData: {
      title: '',
      description: '',
      observationTime: '',
      latitude: '',
      longitude: '',
      properties: {}
    },
    availableImages: [],
    uploadedImages: [],
    uploading: false,
    loading: false,
    message: null,
    propertyKey: '',
    propertyValue: '',
    onInputChange: jest.fn(),
    onImageSelection: jest.fn(),
    onFileSelect: jest.fn(),
    onUploadImages: jest.fn(),
    onAddProperty: jest.fn(),
    onRemoveProperty: jest.fn(),
    onGetCurrentLocation: jest.fn(),
    onSubmit: jest.fn(),
    onClearMessage: jest.fn(),
    onPropertyKeyChange: jest.fn(),
    onPropertyValueChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render the form with all required fields', () => {
    render(<ObservationFormUI {...defaultProps} />);
    
    expect(screen.getByText('Create Observation')).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description *')).toBeInTheDocument();
    expect(screen.getByLabelText('Observation Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Latitude')).toBeInTheDocument();
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument();
    expect(screen.getByText('Submit Observation')).toBeInTheDocument();
  });

  test('should call onInputChange when form fields are changed', () => {
    render(<ObservationFormUI {...defaultProps} />);
    
    const titleInput = screen.getByLabelText('Title *');
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    
    expect(defaultProps.onInputChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'title',
          value: 'Test Title'
        })
      })
    );
  });

  test('should call onSubmit when form is submitted', () => {
    render(<ObservationFormUI {...defaultProps} />);
    
    const submitButton = screen.getByText('Submit Observation');
    fireEvent.click(submitButton);
    
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  test('should call onGetCurrentLocation when get location button is clicked', () => {
    render(<ObservationFormUI {...defaultProps} />);
    
    const locationButton = screen.getByText('Get Current Location');
    fireEvent.click(locationButton);
    
    expect(defaultProps.onGetCurrentLocation).toHaveBeenCalled();
  });

  test('should display message when provided', () => {
    const message = { type: 'success', text: 'Observation created successfully!' };
    render(<ObservationFormUI {...defaultProps} message={message} />);
    
    expect(screen.getByText('Observation created successfully!')).toBeInTheDocument();
  });

  test('should call onClearMessage when message close button is clicked', () => {
    const message = { type: 'error', text: 'An error occurred' };
    render(<ObservationFormUI {...defaultProps} message={message} />);
    
    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClearMessage).toHaveBeenCalled();
  });

  test('should display available images when provided', () => {
    const availableImages = [
      { id: '1', filename: 'image1.jpg' },
      { id: '2', filename: 'image2.jpg' }
    ];
    render(<ObservationFormUI {...defaultProps} availableImages={availableImages} />);
    
    expect(screen.getByText('image1.jpg')).toBeInTheDocument();
    expect(screen.getByText('image2.jpg')).toBeInTheDocument();
  });

  test('should call onImageSelection when image is selected', () => {
    const availableImages = [{ id: '1', filename: 'image1.jpg' }];
    render(<ObservationFormUI {...defaultProps} availableImages={availableImages} />);
    
    const imageCheckbox = screen.getByRole('checkbox');
    fireEvent.click(imageCheckbox);
    
    expect(defaultProps.onImageSelection).toHaveBeenCalledWith('1', true);
  });

  test('should disable form when loading', () => {
    render(<ObservationFormUI {...defaultProps} loading={true} />);
    
    const titleInput = screen.getByLabelText('Title *');
    const submitButton = screen.getByText('Submit Observation');
    
    expect(titleInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  test('should display custom properties when they exist', () => {
    const formDataWithProperties = {
      ...defaultProps.formData,
      properties: {
        weather: 'sunny',
        temperature: '25°C'
      }
    };
    render(<ObservationFormUI {...defaultProps} formData={formDataWithProperties} />);
    
    expect(screen.getByText('weather: sunny')).toBeInTheDocument();
    expect(screen.getByText('temperature: 25°C')).toBeInTheDocument();
  });

  test('should call onRemoveProperty when property remove button is clicked', () => {
    const formDataWithProperties = {
      ...defaultProps.formData,
      properties: { weather: 'sunny' }
    };
    render(<ObservationFormUI {...defaultProps} formData={formDataWithProperties} />);
    
    const removeButton = screen.getByRole('button', { name: 'Remove' });
    fireEvent.click(removeButton);
    
    expect(defaultProps.onRemoveProperty).toHaveBeenCalledWith('weather');
  });

  test('should render image upload section', () => {
    render(<ObservationFormUI {...defaultProps} />);
    
    expect(screen.getByText('Upload New Images')).toBeInTheDocument();
    expect(screen.getByText('Drag & drop images here, or click to select files')).toBeInTheDocument();
  });

  test('should handle file selection via click', () => {
    render(<ObservationFormUI {...defaultProps} />);
    
    const fileInput = screen.getByLabelText(/Drag & drop images here, or click to select files/i);
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(defaultProps.onFileSelect).toHaveBeenCalledWith([file]);
  });

  test('should handle file selection via drag and drop', () => {
    render(<ObservationFormUI {...defaultProps} />);
    
    const dropzone = screen.getByText('Drag & drop images here, or click to select files').closest('div');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    
    expect(defaultProps.onFileSelect).toHaveBeenCalledWith([file]);
  });

  test('should display uploaded image previews', () => {
    const uploadedImages = [
      new File(['test1'], 'image1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'image2.jpg', { type: 'image/jpeg' })
    ];
    render(<ObservationFormUI {...defaultProps} uploadedImages={uploadedImages} />);
    
    expect(screen.getByAltText('Preview 1')).toBeInTheDocument();
    expect(screen.getByAltText('Preview 2')).toBeInTheDocument();
  });

  test('should show upload button when images are selected', () => {
    const uploadedImages = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];
    render(<ObservationFormUI {...defaultProps} uploadedImages={uploadedImages} />);
    
    expect(screen.getByText('Upload Images')).toBeInTheDocument();
  });

  test('should call onUploadImages when upload button is clicked', () => {
    const uploadedImages = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];
    render(<ObservationFormUI {...defaultProps} uploadedImages={uploadedImages} />);
    
    const uploadButton = screen.getByText('Upload Images');
    fireEvent.click(uploadButton);
    
    expect(defaultProps.onUploadImages).toHaveBeenCalled();
  });

  test('should show uploading state when uploading', () => {
    const uploadedImages = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];
    render(<ObservationFormUI {...defaultProps} uploadedImages={uploadedImages} uploading={true} />);
    
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  test('should disable upload button when uploading', () => {
    const uploadedImages = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];
    render(<ObservationFormUI {...defaultProps} uploadedImages={uploadedImages} uploading={true} />);
    
    const uploadButton = screen.getByText('Uploading...');
    expect(uploadButton).toBeDisabled();
  });
});
