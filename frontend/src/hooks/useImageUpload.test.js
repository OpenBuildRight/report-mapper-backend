import { renderHook, act } from '@testing-library/react';
import { useImageUpload } from './useImageUpload';

// Mock the upload service
const mockUploadService = {
  uploadMultipleImages: jest.fn()
};

describe('useImageUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with default state', () => {
    const { result } = renderHook(() => useImageUpload(mockUploadService));

    expect(result.current.uploadedImages).toEqual([]);
    expect(result.current.uploading).toBe(false);
    expect(result.current.message).toBeNull();
    expect(result.current.formData).toEqual({
      latitude: '',
      longitude: '',
      description: '',
      imageGeneratedTime: ''
    });
  });

  test('should handle input changes', () => {
    const { result } = renderHook(() => useImageUpload(mockUploadService));

    act(() => {
      result.current.handleInputChange({
        target: { name: 'latitude', value: '40.7128' }
      });
    });

    expect(result.current.formData.latitude).toBe('40.7128');
  });

  test('should handle file selection', () => {
    const { result } = renderHook(() => useImageUpload(mockUploadService));

    const testFiles = [
      new File(['test1'], 'image1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'image2.jpg', { type: 'image/jpeg' })
    ];

    act(() => {
      result.current.handleFileSelect(testFiles);
    });

    expect(result.current.uploadedImages).toEqual(testFiles);
  });

  test('should get current location successfully', () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        });
      })
    };
    global.navigator.geolocation = mockGeolocation;

    const { result } = renderHook(() => useImageUpload(mockUploadService));

    act(() => {
      result.current.getCurrentLocation();
    });

    expect(result.current.formData.latitude).toBe('40.7128');
    expect(result.current.formData.longitude).toBe('-74.006');
  });

  test('should handle geolocation error', () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementation((success, error) => {
        error(new Error('Geolocation error'));
      })
    };
    global.navigator.geolocation = mockGeolocation;

    const { result } = renderHook(() => useImageUpload(mockUploadService));

    act(() => {
      result.current.getCurrentLocation();
    });

    expect(result.current.message).toEqual({
      type: 'error',
      text: 'Unable to get current location. Please enter coordinates manually.'
    });
  });

  test('should handle geolocation not supported', () => {
    global.navigator.geolocation = undefined;

    const { result } = renderHook(() => useImageUpload(mockUploadService));

    act(() => {
      result.current.getCurrentLocation();
    });

    expect(result.current.message).toEqual({
      type: 'error',
      text: 'Geolocation is not supported by this browser.'
    });
  });

  test('should upload images successfully', async () => {
    const mockResults = [
      { id: '1', filename: 'image1.jpg' },
      { id: '2', filename: 'image2.jpg' }
    ];
    mockUploadService.uploadMultipleImages.mockResolvedValue(mockResults);

    const { result } = renderHook(() => useImageUpload(mockUploadService));

    const testFiles = [
      new File(['test1'], 'image1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'image2.jpg', { type: 'image/jpeg' })
    ];

    // Set up form data and files
    act(() => {
      result.current.handleFileSelect(testFiles);
      result.current.handleInputChange({
        target: { name: 'latitude', value: '40.7128' }
      });
      result.current.handleInputChange({
        target: { name: 'longitude', value: '-74.0060' }
      });
      result.current.handleInputChange({
        target: { name: 'description', value: 'Test description' }
      });
    });

    await act(async () => {
      const results = await result.current.uploadImages();
    });

    expect(mockUploadService.uploadMultipleImages).toHaveBeenCalledWith(testFiles, {
      latitude: '40.7128',
      longitude: '-74.0060',
      description: 'Test description',
      imageGeneratedTime: ''
    });

    expect(result.current.message).toEqual({
      type: 'success',
      text: 'Successfully uploaded 2 image(s)!'
    });

    // Form should be reset
    expect(result.current.uploadedImages).toEqual([]);
    expect(result.current.formData).toEqual({
      latitude: '',
      longitude: '',
      description: '',
      imageGeneratedTime: ''
    });
  });

  test('should handle upload error', async () => {
    const mockError = new Error('Upload failed');
    mockError.response = { data: { message: 'Server error' } };
    mockUploadService.uploadMultipleImages.mockRejectedValue(mockError);

    const { result } = renderHook(() => useImageUpload(mockUploadService));

    const testFiles = [new File(['test'], 'image.jpg', { type: 'image/jpeg' })];

    act(() => {
      result.current.handleFileSelect(testFiles);
    });

    await act(async () => {
      await result.current.uploadImages();
    });

    expect(result.current.message).toEqual({
      type: 'error',
      text: 'Server error'
    });
  });

  test('should handle upload error without response', async () => {
    const mockError = new Error('Upload failed');
    mockUploadService.uploadMultipleImages.mockRejectedValue(mockError);

    const { result } = renderHook(() => useImageUpload(mockUploadService));

    const testFiles = [new File(['test'], 'image.jpg', { type: 'image/jpeg' })];

    act(() => {
      result.current.handleFileSelect(testFiles);
    });

    await act(async () => {
      await result.current.uploadImages();
    });

    expect(result.current.message).toEqual({
      type: 'error',
      text: 'Failed to upload images. Please try again.'
    });
  });

  test('should show error when no files selected', async () => {
    const { result } = renderHook(() => useImageUpload(mockUploadService));

    await act(async () => {
      const results = await result.current.uploadImages();
    });

    expect(result.current.message).toEqual({
      type: 'error',
      text: 'Please select at least one image to upload.'
    });

    expect(mockUploadService.uploadMultipleImages).not.toHaveBeenCalled();
  });

  test('should clear message', () => {
    const { result } = renderHook(() => useImageUpload(mockUploadService));

    act(() => {
      result.current.clearMessage();
    });

    expect(result.current.message).toBeNull();
  });

  test('should set uploading state during upload', async () => {
    mockUploadService.uploadMultipleImages.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    const { result } = renderHook(() => useImageUpload(mockUploadService));

    const testFiles = [new File(['test'], 'image.jpg', { type: 'image/jpeg' })];

    act(() => {
      result.current.handleFileSelect(testFiles);
    });

    // Start upload
    act(() => {
      result.current.uploadImages();
    });

    expect(result.current.uploading).toBe(true);

    // Wait for upload to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.uploading).toBe(false);
  });
});
