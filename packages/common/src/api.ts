import { Vegetable, BillEntry, VoiceOrderPayload, User, OrderItem, Sale } from './types';

const API_BASE_URL = 'http://localhost:3001/api';

// Helper to handle API responses and errors
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorMsg = `Server responded with status ${response.status}`;
        try {
            // Safely parse the JSON error body.
            const errorBody: unknown = await response.json();
            if (
                typeof errorBody === 'object' &&
                errorBody !== null &&
                'error' in errorBody &&
                typeof (errorBody as { error: unknown }).error === 'string'
            ) {
                errorMsg = (errorBody as { error: string }).error;
            }
        } catch (e) {
            // Ignore if response is not JSON
        }
        throw new Error(errorMsg);
    }
    return response.json() as Promise<T>;
}


// --- USER AUTH API ---

export const getUserByPhone = async (phone: string): Promise<User | null> => {
    const response = await fetch(`${API_BASE_URL}/users/phone/${phone}`);
    if (response.status === 404) return null;
    return handleResponse<User>(response);
};

export const createUser = (user: Omit<User, 'id'>): Promise<User> => {
    return fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    }).then(handleResponse<User>);
};

export const signInWithGoogle = (token: string): Promise<{user: User} | {needsOnboarding: true, profile: {name: string, email: string, googleId: string}}> => {
    return fetch(`${API_BASE_URL}/auth/google-signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(handleResponse<{user: User} | {needsOnboarding: true, profile: {name: string, email: string, googleId: string}}>);
};

// --- USER-FACING API ---

export const getTodaysVegetables = (): Promise<Vegetable[]> => {
  return fetch(`${API_BASE_URL}/vegetables`).then(handleResponse<Vegetable[]>);
};

export const getBills = (userId: string): Promise<BillEntry[]> => {
  return fetch(`${API_BASE_URL}/users/${userId}/bills`).then(handleResponse<BillEntry[]>);
};

export const sendDeliveryConfirmation = (userId: string, choice: 'YES' | 'NO'): Promise<{status: string}> => {
    return fetch(`${API_BASE_URL}/delivery-decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, choice }),
    }).then(handleResponse<{status: string}>);
};

export const placeUrgentOrder = (userId: string, items: OrderItem[]): Promise<{status: string}> => {
    return fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items }),
    }).then(handleResponse<{status: string}>);
};

export const sendVoiceOrder = async (payload: VoiceOrderPayload): Promise<{status: string}> => {
    // This can remain a mock or be implemented on the backend later.
    console.log(`API (Mock): Received voice order. Transcription: "${payload.transcription}"`, payload.items);
    await new Promise(res => setTimeout(res, 200)); // Simulate network delay
    return { status: 'success' };
};


// --- ADMIN API ---

export const getUsers = (): Promise<User[]> => {
    return fetch(`${API_BASE_URL}/users`).then(handleResponse<User[]>);
}

export const getSalesData = (): Promise<Sale[]> => {
    return fetch(`${API_BASE_URL}/sales`).then(handleResponse<Sale[]>);
}

export const getDeliveryConfirmations = (): Promise<User[]> => {
    return fetch(`${API_BASE_URL}/deliveries/confirmed`).then(handleResponse<User[]>);
}

export const getDeliveryRejections = (): Promise<User[]> => {
    return fetch(`${API_BASE_URL}/deliveries/rejected`).then(handleResponse<User[]>);
}

export const addVegetable = (veg: Omit<Vegetable, 'id'>): Promise<Vegetable> => {
    return fetch(`${API_BASE_URL}/vegetables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veg)
    }).then(handleResponse<Vegetable>);
};

export const updateVegetable = (veg: Vegetable): Promise<Vegetable> => {
    return fetch(`${API_BASE_URL}/vegetables/${veg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veg)
    }).then(handleResponse<Vegetable>);
};

export const deleteVegetable = (vegId: string): Promise<{status: string}> => {
    return fetch(`${API_BASE_URL}/vegetables/${vegId}`, {
        method: 'DELETE'
    }).then(handleResponse<{status: string}>);
};