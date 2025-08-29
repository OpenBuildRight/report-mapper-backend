import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ObservationFormUI from './ObservationFormUI';
import { FormData, Message } from '../hooks/useObservationForm';
import { Image } from '../services/observationService';

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
      properties: {},
      imageIds: []
    } as FormData,
    availableImages: [] as Image[],
    uploadedImages: [] as File[],
    uploading: false,
    loading: false,
    message: null as Message | null,
    propertyKey: '',
    propertyValue: '',
    onInputChange: jest.fn() as jest.MockedFunction<(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void>,
    onImageSelection: jest.fn() as jest.MockedFunction<(imageId: string) => void>,
    onFileSelect: jest.fn() as jest.MockedFunction<(files: File[]) => void>,
    onUploadImages: jest.fn() as jest.MockedFunction<() => Promise<any>>,
    onAddProperty: jest.fn() as jest.MockedFunction<() => void>,
    onRemoveProperty: jest.fn() as jest.MockedFunction<(key: string) => void>,
    onGetCurrentLocation: jest.fn() as jest.MockedFunction<() => void>,
    onSubmit: jest.fn() as jest.MockedFunction<() => void>,
    onClearMessage: jest.fn() as jest.MockedFunction<() => void>,
    onPropertyKeyChange: jest.fn() as jest.MockedFunction<(value: string) => void>,
    onPropertyValueChange: jest.fn() as jest.MockedFunction<(value: string) => void>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render the form with all required fields', () => {
    render(<ObservationFormUI {...defaultProps} />);
    
    expect(screen.getByRole('heading', { name: 'Create Observation' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter observation title...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter observation description...')).toBeInTheDocument();
    expect(screen.getByText('Observation Time')).toBeInTheDocument();
    expect(screen.getByText('Latitude')).toBeInTheDocument();
    expect(screen.getByText('Longitude')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Observation' })).toBeInTheDocument();
  });

  test('should call onInputChange when form fields are changed', () => {
    render(<ObservationFormUI {...defaultProps} />);
    
    const titleInput = screen.getByPlaceholderText('Enter observation title...');
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    
    expect(defaultProps.onInputChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'title'
        })
      })
    );
  });

  test('should call onSubmit when form is submitted', () => {
    render(<ObservationFormUI {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: 'Create Observation' });
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
    const message: Message = { type: 'success', text: 'Observation created successfully!' };
    render(<ObservationFormUI {...defaultProps} message={message} />);
    
    expect(screen.getByText('Observation created successfully!')).toBeInTheDocument();
  });

  test('should call onClearMessage when message close button is clicked', () => {
    const message: Message = { type: 'error', text: 'An error occurred' };
    render(<ObservationFormUI {...defaultProps} message={message} />);
    
    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClearMessage).toHaveBeenCalled();
  });

  test('should display available images when provided', () => {
    const mockAvailableImages: Image[] = [
      { id: '1', description: 'image1.jpg', createdTime: '2023-01-01T00:00:00Z', imageGeneratedTime: undefined, location: undefined },
      { id: '2', description: 'image2.jpg', createdTime: '2023-01-02T00:00:00Z', imageGeneratedTime: undefined, location: undefined }
    ];
    render(<ObservationFormUI {...defaultProps} availableImages={mockAvailableImages} />);
    
    expect(screen.getByText('image1.jpg')).toBeInTheDocument();
    expect(screen.getByText('image2.jpg')).toBeInTheDocument();
  });

  test('should call onImageSelection when image is selected', () => {
    const mockAvailableImages: Image[] = [{ id: '1', description: 'image1.jpg', createdTime: '2023-01-01T00:00:00Z', imageGeneratedTime: undefined, location: undefined }];
    render(<ObservationFormUI {...defaultProps} availableImages={mockAvailableImages} />);
    
    const imageCheckbox = screen.getByRole('checkbox');
    fireEvent.click(imageCheckbox);
    
    expect(defaultProps.onImageSelection).toHaveBeenCalledWith('1');
  });

  test('should disable form when loading', () => {
    render(<ObservationFormUI {...defaultProps} loading={true} />);
    
    const titleInput = screen.getByPlaceholderText('Enter observation title...');
    const submitButton = screen.getByText('Creating...');
    
    expect(titleInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  test('should display custom properties when they exist', () => {
    const formDataWithProperties: FormData = {
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
    const formDataWithProperties: FormData = {
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
    
    fireEvent.drop(dropzone!, { dataTransfer: { files: [file] } });
    
    expect(defaultProps.onFileSelect).toHaveBeenCalledWith([file]);
  });

  test('should display uploaded image previews', () => {
    const uploadedImages: File[] = [
      new File(['test1'], 'image1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'image2.jpg', { type: 'image/jpeg' })
    ];
    render(<ObservationFormUI {...defaultProps} uploadedImages={uploadedImages} />);
    
    expect(screen.getByAltText('Preview 1')).toBeInTheDocument();
    expect(screen.getByAltText('Preview 2')).toBeInTheDocument();
  });

  test('should show upload button when images are selected', () => {
    const uploadedImages: File[] = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];
    render(<ObservationFormUI {...defaultProps} uploadedImages={uploadedImages} />);
    
    expect(screen.getByText('Upload Images')).toBeInTheDocument();
  });

  test('should call onUploadImages when upload button is clicked', () => {
    const uploadedImages: File[] = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];
    render(<ObservationFormUI {...defaultProps} uploadedImages={uploadedImages} />);
    
    const uploadButton = screen.getByText('Upload Images');
    fireEvent.click(uploadButton);
    
    expect(defaultProps.onUploadImages).toHaveBeenCalled();
  });

  test('should show uploading state when uploading', () => {
    const uploadedImages: File[] = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];
    render(<ObservationFormUI {...defaultProps} uploadedImages={uploadedImages} uploading={true} />);
    
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  test('should disable upload button when uploading', () => {
    const uploadedImages: File[] = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];
    render(<ObservationFormUI {...defaultProps} uploadedImages={uploadedImages} uploading={true} />);
    
    const uploadButton = screen.getByText('Uploading...');
    expect(uploadButton).toBeDisabled();
  });
});
