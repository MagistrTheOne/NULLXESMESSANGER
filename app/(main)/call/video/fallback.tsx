// Fallback to custom VideoCallScreen if Call Kit fails
import VideoCallScreen from "@/components/VideoCall/VideoCallScreen";

export default function VideoCallFallback() {
  return <VideoCallScreen />;
}

