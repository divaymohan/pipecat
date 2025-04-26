import {
  RTVIClientAudio,
  RTVIClientVideo,
  useRTVIClientTransportState,
} from '@pipecat-ai/client-react';
import { RTVIProvider } from './providers/RTVIProvider';
import { ConnectButton } from './components/ConnectButton';
import { StatusDisplay } from './components/StatusDisplay';
import { DebugDisplay } from './components/DebugDisplay';
import { RecordingPanel } from './components/RecordingPanel';
import './App.css';
import { TranscriptDisplay } from './components/Transcript';
import { useState } from 'react';

function BotVideo() {
  const transportState = useRTVIClientTransportState();
  const isConnected = transportState !== 'disconnected';

  return (
    <div className="bot-container">
      <div className="video-container">
        {isConnected && <RTVIClientVideo participant="bot" fit="cover" />}
      </div>
    </div>
  );
}

function AppContent() {
  const [showRecording, setShowRecording] = useState(false);
  const transportState = useRTVIClientTransportState();
  const isConnected = ['connected', 'ready'].includes(transportState);

  const handleDisconnect = () => {
    setShowRecording(true);
  };

  return (
    <div className="app">
      <div className="status-bar">
        <StatusDisplay />
        <ConnectButton onDisconnect={handleDisconnect} />
      </div>

      <div className="main-content">
        <BotVideo />
        {!isConnected && showRecording && <RecordingPanel isVisible={true} />}
      </div>

      {/* Only show Transcript and Debug panels when connected */}
      {isConnected && (
        <>
          <TranscriptDisplay />
          <DebugDisplay />
        </>
      )}
      
      <RTVIClientAudio />
    </div>
  );
}

function App() {
  return (
    <RTVIProvider>
      <AppContent />
    </RTVIProvider>
  );
}

export default App;
