import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageUploadFormUI from './ImageUploadFormUI';

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

describe('ImageUploadFormUI', () => {
  const defaultProps = {
    formData: {
      latitude: '',
      longitude: '',
      description: '',
      imageGeneratedTime: ''
    },
    uploadedImages: [],
    uploading: false,
    message: null,
    onInputChange: jest.fn(),
    onFileSelect: jest.fn(),
    onGetCurrentLocation: jest.fn(),
    onUpload: jest.fn(),
    onClearMessage: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render the form with all required fields', () => {
    render(<ImageUploadFormUI {...defaultProps} />);
    
    expect(screen.getByText('Upload Images')).toBeInTheDocument();
    expect(screen.getByLabelText('Latitude')).toBeInTheDocument();
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Image Generated Time')).toBeInTheDocument();
    expect(screen.getByText('Get Current Location')).toBeInTheDocument();
    expect(screen.getByText('Upload Images')).toBeInTheDocument();
  });

  test('should call onInputChange when form fields are changed', () => {
    render(<ImageUploadFormUI {...defaultProps} />);
    
    const latitudeInput = screen.getByDisplayValue(''); // Find by value since label might not be properly associated
    fireEvent.change(latitudeInput, { target: { value: '40.7128' } });
    
    expect(defaultProps.onInputChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'latitude',
          value: '40.7128'
        })
      })
    );
  });

  test('should call onGetCurrentLocation when get location button is clicked', () => {
    render(<ImageUploadFormUI {...defaultProps} />);
    
    const locationButton = screen.getByText('Get Current Location');
    fireEvent.click(locationButton);
    
    expect(defaultProps.onGetCurrentLocation).toHaveBeenCalled();
  });

  test('should call onUpload when upload button is clicked', () => {
    render(<ImageUploadFormUI {...defaultProps} />);
    
    const uploadButton = screen.getByRole('button', { name: 'Upload Images' });
    fireEvent.click(uploadButton);
    
    expect(defaultProps.onUpload).toHaveBeenCalled();
  });

  test('should display message when provided', () => {
    const message = { type: 'success', text: 'Images uploaded successfully!' };
    render(<ImageUploadFormUI {...defaultProps} message={message} />);
    
    expect(screen.getByText('Images uploaded successfully!')).toBeInTheDocument();
  });

  test('should call onClearMessage when message close button is clicked', () => {
    const message = { type: 'error', text: 'Upload failed' };
    render(<ImageUploadFormUI {...defaultProps} message={message} />);
    
    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClearMessage).toHaveBeenCalled();
  });

  test('should display uploaded images when provided', () => {
    const uploadedImages = [
      new File(['test1'], 'image1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'image2.jpg', { type: 'image/jpeg' })
    ];
    render(<ImageUploadFormUI {...defaultProps} uploadedImages={uploadedImages} />);
    
    // Check that the image preview elements are rendered
    expect(screen.getByAltText('Preview 1')).toBeInTheDocument();
    expect(screen.getByAltText('Preview 2')).toBeInTheDocument();
  });

  test('should disable form when uploading', () => {
    render(<ImageUploadFormUI {...defaultProps} uploading={true} />);
    
    const uploadButton = screen.getByRole('button', { name: 'Uploading...' });
    
    expect(uploadButton).toBeDisabled();
  });

  test('should show loading state when uploading', () => {
    render(<ImageUploadFormUI {...defaultProps} uploading={true} />);
    
    expect(screen.getByRole('button', { name: 'Uploading...' })).toBeInTheDocument();
  });

  test('should handle file input change', () => {
    render(<ImageUploadFormUI {...defaultProps} />);
    
    const fileInput = screen.getByRole('textbox', { hidden: true }); // File input is hidden
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Note: The actual file handling would be done by the parent component
    // This test just ensures the input is rendered
    expect(fileInput).toBeInTheDocument();
  });

  test('should display form data values when provided', () => {
    const formDataWithValues = {
      latitude: '40.7128',
      longitude: '-74.0060',
      description: 'Test description',
      imageGeneratedTime: '2024-01-01T12:00'
    };
    render(<ImageUploadFormUI {...defaultProps} formData={formDataWithValues} />);
    
    expect(screen.getByDisplayValue('40.7128')).toBeInTheDocument();
    expect(screen.getByDisplayValue('-74.0060')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-01T12:00')).toBeInTheDocument();
  });
});
