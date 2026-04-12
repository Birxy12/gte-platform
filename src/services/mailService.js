import { collection, addDoc, getDoc, getDocs, doc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

export const mailService = {
    /**
     * Send a templated email to a specific user
     */
    async sendEmail(userId, templateId, extraData = {}, directPayload = null) {
        if (!userId) return;

        try {
            // 1. Get User Info
            const userSnap = await getDoc(doc(db, "users", userId));
            if (!userSnap.exists()) return;
            const userData = userSnap.data();

            let subject = "";
            let body = "";

            // 2. Get Template or Direct Payload
            if (directPayload) {
                subject = directPayload.subject;
                body = directPayload.body;
            } else if (templateId) {
                const templateSnap = await getDoc(doc(db, "mailTemplates", templateId));
                if (templateSnap.exists()) {
                    const template = templateSnap.data();
                    subject = template.subject;
                    body = template.body;
                } else {
                    console.error(`Template ${templateId} not found, and no fallback provided.`);
                    return;
                }
            } else {
                return;
            }

            // 3. Prepare Payload
            const placeholders = {
                username: userData.username || userData.email.split('@')[0],
                email: userData.email,
                ...extraData
            };

            // Replace placeholders {{variable}}
            Object.keys(placeholders).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                subject = subject.replace(regex, placeholders[key]);
                body = body.replace(regex, placeholders[key]);
            });

            // 4. Queue Email (Standard Firebase "Trigger Email" extension pattern)
            await addDoc(collection(db, "mail"), {
                to: userData.email,
                message: {
                    subject: subject,
                    text: body,
                    html: `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">${body.replace(/\n/g, '<br>')}</div>`
                },
                templateId: templateId,
                timestamp: serverTimestamp()
            });

        } catch (error) {
            console.error("Failed to queue email:", error);
        }
    },

    /**
     * Broadcast a templated email to all users
     */
    async broadcastEmail(templateId, extraData = {}, directPayload = null) {
        if (!templateId && !directPayload) return;
        try {
            // Get all active users
            const usersSnap = await getDocs(collection(db, "users"));
            const sendPromises = usersSnap.docs.map(userDoc => 
                this.sendEmail(userDoc.id, templateId, extraData, directPayload)
            );
            await Promise.all(sendPromises);
        } catch (error) {
            console.error("Broadcast failed:", error);
        }
    }
};
