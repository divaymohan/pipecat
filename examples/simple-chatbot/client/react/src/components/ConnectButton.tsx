import {
  useRTVIClient,
  useRTVIClientTransportState,
} from '@pipecat-ai/client-react';
import { getBackendUrl } from '../utils/env';

interface ConnectButtonProps {
  onDisconnect?: () => void;
}

export function ConnectButton({ onDisconnect }: ConnectButtonProps) {
  const client = useRTVIClient();
  const transportState = useRTVIClientTransportState();
  const isConnected = ['connected', 'ready'].includes(transportState);

  const handleClick = async () => {
    if (!client) {
      console.error('RTVI client is not initialized');
      return;
    }

    try {
      if (isConnected) {
        console.log('Disconnecting from RTVI service...');
        await client.disconnect();
        console.log('Successfully disconnected from RTVI service');
        
        // Call the server API to get the recording
        try {
          // Use the utility function to get the backend URL
          const backendUrl = getBackendUrl();
          console.log(`Fetching recording after disconnect from: ${backendUrl}/latest-recording`);
          
          const response = await fetch(`${backendUrl}/latest-recording`, {
            // Remove credentials to fix CORS error
            // credentials: 'include',
          });
          
          console.log('Recording fetch response after disconnect:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
          });
          
          // Clear all recordings after fetching the latest one
          try {
            console.log(`Clearing all recordings at: ${backendUrl}/clear-recordings`);
            const clearResponse = await fetch(`${backendUrl}/clear-recordings`, {
              method: 'POST',
              // Remove credentials to fix CORS error
              // credentials: 'include',
            });
            
            console.log('Clear recordings response:', {
              status: clearResponse.status,
              statusText: clearResponse.statusText,
            });
            
            if (clearResponse.ok) {
              const result = await clearResponse.json();
              console.log('Clear recordings result:', result);
            }
          } catch (clearError) {
            console.error('Error clearing recordings:', clearError);
          }
          
          // Notify parent component that disconnection is complete
          if (onDisconnect) {
            console.log('Calling onDisconnect callback');
            onDisconnect();
          }
        } catch (error) {
          console.error('Error fetching recording after disconnect:', error);
        }
      } else {
        console.log('Connecting to RTVI service...');
        await client.connect();
        console.log('Successfully connected to RTVI service');
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  return (
    <div className="controls">
      <button
        className={isConnected ? 'disconnect-btn' : 'connect-btn'}
        onClick={handleClick}
        disabled={
          !client || ['connecting', 'disconnecting'].includes(transportState)
        }>
        {isConnected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}
