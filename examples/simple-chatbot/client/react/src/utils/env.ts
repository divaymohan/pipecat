// Define the environment variables interface
interface ImportMetaEnv {
  VITE_BACKEND_URL?: string;
}

// Declare the import.meta.env type
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Get the backend URL from environment variables or use default
export const getBackendUrl = (): string => {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:7860';
}; 