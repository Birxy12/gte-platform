import React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '../../context/AuthProvider';
import { X } from 'lucide-react';

export default function ZegoCall({ callID, onEnd, type = "video" }) {
    const { user } = useAuth();

    const myMeeting = async (element) => {
        // Generate Kit Token
        const appID = Number(import.meta.env.VITE_ZEGO_APP_ID) || 123456789;
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || "xxxxxxxxxxxx";
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            callID,
            user.uid,
            user.displayName || user.email
        );

        // Create instance object from Kit Token.
        const zp = ZegoUIKitPrebuilt.create(kitToken);

        // Start the call
        zp.joinRoom({
            container: element,
            scenario: {
                mode: type === "video" ? ZegoUIKitPrebuilt.OneONoneVideoCall : ZegoUIKitPrebuilt.GroupCall,
            },
            showPreJoinView: false,
            onLeaveRoom: onEnd,
        });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            <div className="p-4 flex justify-end bg-black text-white">
                <button onClick={onEnd} className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors">
                    <X size={24} />
                </button>
            </div>
            <div
                className="flex-1 w-full"
                ref={myMeeting}
            />
        </div>
    );
}
