import { collection, addDoc, getDoc, getDocs, doc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

export const mailService = {
    /**
     * Send a templated email to a specific user
     */
    async sendEmail(userId, templateId, extraData = {}) {
        if (!userId || !templateId) return;

        try {
            // 1. Get User Info
            const userSnap = await getDoc(doc(db, "users", userId));
            if (!userSnap.exists()) return;
            const userData = userSnap.data();

            // 2. Get Template
            const templateSnap = await getDoc(doc(db, "mailTemplates", templateId));
            if (!templateSnap.exists()) {
                console.error(`Template ${templateId} not found.`);
                return;
            }
            const template = templateSnap.data();

            // 3. Prepare Payload
            const placeholders = {
                username: userData.username || userData.email.split('@')[0],
                email: userData.email,
                ...extraData
            };

            let subject = template.subject;
            let body = template.body;

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
    async broadcastEmail(templateId, extraData = {}) {
        if (!templateId) return;
        try {
            // Get all active users
            const usersSnap = await getDocs(collection(db, "users"));
            const sendPromises = usersSnap.docs.map(userDoc => 
                this.sendEmail(userDoc.id, templateId, extraData)
            );
            await Promise.all(sendPromises);
        } catch (error) {
            console.error("Broadcast failed:", error);
        }
    }
};
