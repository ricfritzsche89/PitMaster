import { db } from '../firebase';
import { collection, addDoc, getDoc, doc, updateDoc, arrayUnion, onSnapshot, deleteDoc, setDoc, query, where, getDocs } from 'firebase/firestore';

const EVENTS_COLLECTION = 'events';

// --- BETTING FUNCTIONS ---

// Place a bet (Subcollection 'bets')
export const placeBet = async (eventId, betData) => {
    // betData: { user, target, type, amount, timestamp }
    const betsRef = collection(db, EVENTS_COLLECTION, eventId, 'bets');
    const docRef = await addDoc(betsRef, {
        ...betData,
        timestamp: Date.now()
    });
    return docRef.id;
};

// Delete a bet
export const deleteBet = async (eventId, betId) => {
    const docRef = doc(db, EVENTS_COLLECTION, eventId, 'bets', betId);
    await deleteDoc(docRef);
};

// Update Betting Status (open/closed)
export const updateBettingStatus = async (eventId, status) => {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, { bettingStatus: status });
};

// Set Competition Results
export const setCompetitionResults = async (eventId, results) => {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, {
        bettingResults: results,
        bettingStatus: 'finished'
    });
};

// Subscribe to Bets (Real-time odds)
export const subscribeToBets = (eventId, callback) => {
    const betsRef = collection(db, EVENTS_COLLECTION, eventId, 'bets');
    return onSnapshot(betsRef, (snapshot) => {
        const bets = [];
        snapshot.forEach(doc => bets.push({ id: doc.id, ...doc.data() }));
        callback(bets);
    });
};

// --- FEEDBACK FUNCTIONS ---

// Submit Feedback
export const submitFeedback = async (eventId, feedbackData) => {
    // feedbackData: { rating_food, rating_vibes, rating_music, comment }
    const feedbackRef = collection(db, EVENTS_COLLECTION, eventId, 'feedback');
    await addDoc(feedbackRef, {
        ...feedbackData,
        timestamp: Date.now()
    });
};

// Subscribe to Feedback
export const subscribeToFeedback = (eventId, callback) => {
    const feedbackRef = collection(db, EVENTS_COLLECTION, eventId, 'feedback');
    return onSnapshot(feedbackRef, (snapshot) => {
        const feedback = [];
        snapshot.forEach(doc => feedback.push({ id: doc.id, ...doc.data() }));
        callback(feedback);
    });
};

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

// --- PARTICIPANTS FUNCTIONS (SHOOTING MATCH) ---

export const deleteEvent = async (eventId) => {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await deleteDoc(docRef);
};

// Subscribe to Participants
export const subscribeToParticipants = (eventId, callback) => {
    const ref = collection(db, EVENTS_COLLECTION, eventId, 'participants');
    return onSnapshot(ref, (snapshot) => {
        const data = [];
        snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
        callback(data);
    });
};

// Check and Add Participant (Avoid Duplicates)
export const checkAndAddParticipant = async (eventId, name) => {
    const ref = collection(db, EVENTS_COLLECTION, eventId, 'participants');
    // Simple query to check if name exists
    const q = query(ref, where("name", "==", name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id; // Return existing ID
    }

    // Not found, add new
    return await addParticipant(eventId, name);
};

// Add Participant
export const addParticipant = async (eventId, name, image = null) => {
    const ref = collection(db, EVENTS_COLLECTION, eventId, 'participants');
    await addDoc(ref, {
        name,
        image, // Base64 string
        round1: [null, null, null, null, null],
        round2: [null, null, null, null, null],
        stats: { Gewehr: 50, Bogen: 50, Durst: 50, Hunger: 50 }, // Defaults from legacy app
        timestamp: Date.now()
    });
};

// Update Participant Score
export const updateParticipant = async (eventId, participantId, data) => {
    const ref = doc(db, EVENTS_COLLECTION, eventId, 'participants', participantId);
    await updateDoc(ref, data);
};

// Delete Participant
export const deleteParticipant = async (eventId, participantId) => {
    const ref = doc(db, EVENTS_COLLECTION, eventId, 'participants', participantId);
    await deleteDoc(ref);
};

// Create a new event with extended v2 schema

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
        const plusOneName = guestData.name + " +1";

        // Remove existing entries for this user and their potential +1
        guests = guests.filter(g => g.name !== guestData.name && g.name !== plusOneName);

        // Add Main Guest
        guests.push({
            ...guestData,
            hasPaid: false,
            contribution: 0
        });

        // Add Plus One if applicable
        if (guestData.status === 'accepted' && guestData.hasPlusOne) {
            guests.push({
                name: plusOneName,
                status: 'accepted',
                isPlusOne: true,
                hasPaid: false,
                contribution: 0,
                timestamp: Date.now()
            });
        }

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

export const addToBringList = async (eventId, itemData) => {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, {
        bringList: arrayUnion(itemData)
    });
};

// --- HALL OF FAME FUNCTIONS ---

export const saveHallOfFameEntry = async (entryData) => {
    // entryData: { eventId, eventName, participantName, rank, type, theme, imageData, date }
    const ref = collection(db, 'hallOfFame');
    await addDoc(ref, {
        ...entryData,
        timestamp: Date.now()
    });
};

export const getHallOfFameEntries = async (limitCount = 20) => {
    const ref = collection(db, 'hallOfFame');
    // For now, simple fetch. Ideally order by timestamp desc.
    const snapshot = await import('firebase/firestore').then(mod => {
        const { query, orderBy, limit, getDocs } = mod;
        const q = query(ref, orderBy('timestamp', 'desc'), limit(limitCount));
        return getDocs(q);
    });

    const data = [];
    snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
    return data;
};
