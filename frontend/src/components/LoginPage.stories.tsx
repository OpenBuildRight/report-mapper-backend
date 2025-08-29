import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import LoginPage from './LoginPage';

const meta: Meta<typeof LoginPage> = {
  title: 'Components/LoginPage',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoginPage>;

const Template: Story = {
  render: (args) => <LoginPage {...args} />,
};

export const Default: Story = {
  ...Template,
  args: {},
};

export const Loading: Story = {
  ...Template,
  args: {},
};

export const Authenticated: Story = {
  ...Template,
  args: {},
};

// Alternative approach without mocking - create a wrapper component
const LoginPageWrapper: React.FC<{
  isLoading?: boolean;
  isAuthenticated?: boolean;
  signinRedirect?: () => void;
}> = ({ isLoading = false, isAuthenticated = false, signinRedirect = () => console.log('Sign in clicked') }) => {
  // Mock localStorage
  const originalGetItem = localStorage.getItem;
  const originalRemoveItem = localStorage.removeItem;
  
  React.useEffect(() => {
    localStorage.getItem = jest.fn();
    localStorage.removeItem = jest.fn();
    
    return () => {
      localStorage.getItem = originalGetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>
          Report Mapper
        </h1>
        <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
          Please sign in to access the application
        </p>
        
        <button
          onClick={signinRedirect}
          style={{
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%',
            transition: 'background 0.3s ease'
          }}
          onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#2980b9'}
          onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#3498db'}
        >
          Sign In
        </button>
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#95a5a6' }}>
          <p><strong>Test Credentials:</strong></p>
          <p>Username: <code>alice</code></p>
          <p>Password: <code>alice_password</code></p>
        </div>
      </div>
    </div>
  );
};

export const LoginPageUI: Story = {
  render: (args) => <LoginPageWrapper {...args} />,
  args: {
    isLoading: false,
    isAuthenticated: false,
    signinRedirect: () => console.log('Sign in clicked'),
  },
};
