import React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '../../context/AuthProvider';
import { X } from 'lucide-react';

export default function ZegoCall({ callID, onEnd, type = "video" }) {
    const { user } = useAuth();
    const containerRef = useRef(null);
    const zpRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !user) return;

        const initCall = async () => {
            // Force Hardcoded App ID & Secret to bypass Vite caching
            const appID = 1730644229;
            const serverSecret = "ffa07942558bc7052de9e2a7b4f1672cfa8cc4de58bd3788679cad123f78df92";

            try {
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    appID,
                    serverSecret,
                    callID,
                    user.uid,
                    user.displayName || user.email || user.uid
                );

                // Create instance object from Kit Token.
                const zp = ZegoUIKitPrebuilt.create(kitToken);
                zpRef.current = zp;

                // Start the call
                zp.joinRoom({
                    container: containerRef.current,
                    scenario: {
                        mode: type === "video" ? ZegoUIKitPrebuilt.OneONoneVideoCall : ZegoUIKitPrebuilt.GroupCall,
                    },
                    showPreJoinView: false,
                    onLeaveRoom: () => {
                        if (onEnd) onEnd();
                    },
                });
            } catch (err) {
                console.error("Zego Initialization Error:", err);
                alert("Failed to initialize call. Please check credentials.");
                if (onEnd) onEnd();
            }
        };

        initCall();

        return () => {
            if (zpRef.current) {
                // Potential cleanup logic if needed by Zego SDK
                // zpRef.current.destroy(); // Not always available in Prebuilt
            }
        };
    }, [callID, user, type, onEnd]);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            <div className="p-4 flex justify-end bg-black text-white">
                <button onClick={onEnd} className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors">
                    <X size={24} />
                </button>
            </div>
            <div
                className="flex-1 w-full"
                ref={containerRef}
            />
        </div>
    );
}
