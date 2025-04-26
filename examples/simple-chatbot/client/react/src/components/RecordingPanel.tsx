import { useState, useEffect, useRef } from 'react';
import { getBackendUrl } from '../utils/env';

interface RecordingPanelProps {
  isVisible: boolean;
}

export function RecordingPanel({ isVisible }: RecordingPanelProps) {
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const pollingIntervalRef = useRef<number | null>(null);
  const maxRetries = 10; // Maximum number of retries
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (isVisible) {
      console.log('RecordingPanel is now visible, starting to fetch recording...');
      startPolling();
    } else {
      stopPolling();
    }

    // Cleanup function to stop polling when component unmounts
    return () => {
      stopPolling();
    };
  }, [isVisible]);

  const stopPolling = () => {
    if (pollingIntervalRef.current !== null) {
      window.clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const startPolling = () => {
    // Reset retry count
    retryCountRef.current = 0;
    setProcessingStatus('Waiting for recording to be processed...');
    
    // Start polling immediately
    fetchRecording();
    
    // Then set up interval for polling
    pollingIntervalRef.current = window.setInterval(() => {
      fetchRecording();
    }, 2000); // Poll every 2 seconds
  };

  const fetchRecording = async () => {
    // If we already have a recording URL, stop polling
    if (recordingUrl) {
      stopPolling();
      return;
    }

    // If we've reached max retries, stop polling
    if (retryCountRef.current >= maxRetries) {
      stopPolling();
      setError('Maximum retry attempts reached. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Use the utility function to get the backend URL
      const backendUrl = getBackendUrl();
      console.log(`Polling for recording from: ${backendUrl}/latest-recording (attempt ${retryCountRef.current + 1}/${maxRetries})`);
      
      const response = await fetch(`${backendUrl}/latest-recording`, {
        // Remove credentials to fix CORS error
        // credentials: 'include',
      });
      
      console.log('Recording fetch response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        type: response.type,
      });
      
      if (response.status !== 200) {
        // Recording not ready yet
        retryCountRef.current += 1;
        setProcessingStatus(`Waiting for recording to be processed... (attempt ${retryCountRef.current}/${maxRetries})`);
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recording: ${response.statusText}`);
      }
      
      // Create a blob URL from the response
      const blob = await response.blob();
      console.log('Recording blob received:', {
        size: blob.size,
        type: blob.type,
      });
      
      const url = URL.createObjectURL(blob);
      console.log('Created blob URL:', url);
      setRecordingUrl(url);
      setProcessingStatus('');
      stopPolling(); // Stop polling once we have the recording
    } catch (err) {
      console.error('Error fetching recording:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      retryCountRef.current += 1;
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="recording-panel">
      <h3>Recording</h3>
      
      {isLoading && <p>Loading recording...</p>}
      
      {processingStatus && <p className="processing-status">{processingStatus}</p>}
      
      {error && <p className="error">Error: {error}</p>}
      
      {recordingUrl && (
        <div className="audio-player">
          <audio 
            controls 
            src={recordingUrl}
            onLoadedMetadata={() => console.log('Audio metadata loaded successfully')}
            onError={(e) => console.error('Audio loading error:', e)}
          >
            Your browser does not support the audio element.
          </audio>
          <button onClick={fetchRecording} className="refresh-btn">
            Refresh Recording
          </button>
        </div>
      )}
    </div>
  );
} 