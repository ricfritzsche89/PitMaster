import { db } from '../firebase';
import { collection, addDoc, getDoc, doc, updateDoc, arrayUnion, onSnapshot, deleteDoc } from 'firebase/firestore';

const EVENTS_COLLECTION = 'events';

// Create a new event with extended v2 schema
export const createEvent = async (eventData) => {
    try {
        const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
            ...eventData,
            expenses: eventData.expenses || [],
            maxGuests: eventData.maxGuests || 0,
            isRecurring: eventData.isRecurring || false,
            adminShare: eventData.adminShare ?? 100,
            budgetLimit: eventData.budgetLimit || 0,
            createdAt: Date.now(),
            guests: []
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const deleteEvent = async (eventId) => {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await deleteDoc(docRef);
};

export const getEvent = async (eventId) => {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        throw new Error("Event not found");
    }
};

// Real-time listener for a single event
export const subscribeToEvent = (eventId, callback) => {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() });
        } else {
            callback(null); // Document deleted or not found
        }
    });
};

export const rsvpToEvent = async (eventId, guestData) => {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    try {
        const snap = await getDoc(docRef);
        if (!snap.exists()) throw new Error("Event not found");

        let guests = snap.data().guests || [];
        guests = guests.filter(g => g.name !== guestData.name);

        guests.push({
            ...guestData,
            hasPaid: false,
            contribution: 0
        });

        await updateDoc(docRef, { guests });
    } catch (e) {
        console.error("RSVP Error", e);
        throw e;
    }
};

export const updateEvent = async (eventId, data) => {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, data);
};
