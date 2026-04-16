'use client'

import { JitsiMeeting } from '@jitsi/react-sdk'

export function JitsiWrapper({ roomName, displayName, email }: { roomName: string, displayName: string, email: string }) {
  return (
    <div className="w-full h-full relative">
      <JitsiMeeting
        roomName={roomName.replace(/[^a-zA-Z0-9]/g, '')} // Jitsi requires strict alphanumeric room ids usually
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: false,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
        }}
        userInfo={{
          displayName,
          email
        }}
        getIFrameRef={(iframeRef) => { 
          iframeRef.style.height = '100%'; 
          iframeRef.style.width = '100%';
        }}
      />
    </div>
  )
}
