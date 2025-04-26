import { useRef, useCallback } from 'react';
import './DebugDisplay.css';
import { useRTVIClientEvent } from '@pipecat-ai/client-react';
import { BotLLMTextData, RTVIEvent, TranscriptData } from '@pipecat-ai/client-js';

export function TranscriptDisplay() {
  const debugLogRef = useRef<HTMLDivElement>(null);

  const log = useCallback((message: string) => {
    if (!debugLogRef.current) return;

    const entry = document.createElement('div');
    entry.textContent = `${message}`;

    // Add styling based on message type
    if (message.startsWith('User: ')) {
      entry.style.color = '#2196F3'; // blue for user
      debugLogRef.current.appendChild(entry);
      debugLogRef.current.scrollTop = debugLogRef.current.scrollHeight;
    } else if (message.startsWith('Bot: ')) {
      entry.style.color = '#4CAF50'; // green for bot
      debugLogRef.current.appendChild(entry);
      debugLogRef.current.scrollTop = debugLogRef.current.scrollHeight;
    }

    
  }, []);

  // Log transcripts
    useRTVIClientEvent(
      RTVIEvent.UserTranscript,
      useCallback(
        (data: TranscriptData) => {
          // Only log final transcripts
          if (data.final) {
            log(`User: ${data.text}`);
          }
        },
        [log]
      )
    );

    useRTVIClientEvent(
        RTVIEvent.BotTranscript,
        useCallback(
          (data: BotLLMTextData) => {
            log(`Bot: ${data.text}`);
          },
          [log]
        )
      );
  


  return (
    <div className="debug-panel">
      <h3>Transcript</h3>
      <div ref={debugLogRef} className="debug-log" />
    </div>
  );
}
