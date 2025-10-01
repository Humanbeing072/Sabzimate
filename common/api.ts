import { getDB, setDB } from './data/localStorageManager';
import { Vegetable, BillEntry, VoiceOrderPayload, User, Sale, OrderItem } from './types';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- USER-FACING API ---

export const getTodaysVegetables = async (): Promise<Vegetable[]> => {
  await delay(100);
  const db = getDB();
  return db.vegetablesDB;
};

export const getBills = async (user: User): Promise<BillEntry[]> => {
  await delay(500);
  const db = getDB();
  const userSales = db.salesDB.filter(sale => sale.userId === user.phone);
  const userBills: BillEntry[] = userSales.map(sale => ({
      date: sale.date,
      items: sale.items.map(item => ({
          name: item.vegetableName,
          quantity: item.quantity,
          price: item.price,
      })),
      total: sale.total,
  }));
  console.log(`API: Fetched ${userBills.length} bills for user ${user.name}`);
  return userBills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const sendDeliveryConfirmation = async (choice: 'YES' | 'NO', user: User): Promise<{status: string}> => {
    await delay(300);
    const db = getDB();
    console.log(`API: Received delivery confirmation. Choice: ${choice} for user: ${user.name}`);
    
    // Remove user from both lists to prevent duplicates
    db.deliveryConfirmationsDB = db.deliveryConfirmationsDB.filter(u => u.phone !== user.phone);
    db.deliveryRejectionsDB = db.deliveryRejectionsDB.filter(u => u.phone !== user.phone);

    // Add to the correct list
    if (choice === 'YES') {
        db.deliveryConfirmationsDB.push(user);
    } else {
        db.deliveryRejectionsDB.push(user);
    }
    setDB(db);
    return { status: 'success' };
};

export const sendVoiceOrder = async (payload: VoiceOrderPayload): Promise<{status: string}> => {
    await delay(400);
    console.log(`API: Received voice order. Transcription: "${payload.transcription}"`, payload.items);
    return { status: 'success' };
};

export const placeUrgentOrder = async (user: User, items: {veg: Vegetable, quantity: string}[]): Promise<{status: string}> => {
    await delay(500);
    const db = getDB();
    const saleItems = items.map(item => ({
        vegetableId: item.veg.id,
        vegetableName: item.veg.name['EN'],
        quantity: item.quantity,
        price: item.veg.price * (parseInt(item.quantity) / 1000) // Simplified price calculation
    }));
    const total = saleItems.reduce((acc, item) => acc + item.price, 0);
    
    const newSale: Sale = {
        userId: user.phone,
        date: new Date().toISOString().split('T')[0],
        items: saleItems,
        total: total,
    };
    db.salesDB.push(newSale);
    setDB(db);
    console.log("API: Placed urgent order", newSale);
    return { status: 'success' };
}

// --- ADMIN API ---

export const getUsers = async (): Promise<User[]> => {
    await delay(200);
    const db = getDB();
    return db.usersDB;
}

export const getSalesData = async (): Promise<Sale[]> => {
    await delay(300);
    const db = getDB();
    return db.salesDB;
}

export const getDeliveryConfirmations = async (): Promise<User[]> => {
    await delay(200);
    const db = getDB();
    return db.deliveryConfirmationsDB;
}

export const getDeliveryRejections = async (): Promise<User[]> => {
    await delay(200);
    const db = getDB();
    return db.deliveryRejectionsDB;
}

export const addVegetable = async (veg: Omit<Vegetable, 'id'>): Promise<Vegetable> => {
    await delay(400);
    const db = getDB();
    const newId = db.vegetablesDB.length > 0 ? Math.max(...db.vegetablesDB.map(v => v.id)) + 1 : 1;
    const newVegetable: Vegetable = { ...veg, id: newId };
    db.vegetablesDB.push(newVegetable);
    setDB(db);
    console.log("API: Added new vegetable.", newVegetable);
    return newVegetable;
};

export const updateVegetable = async (veg: Vegetable): Promise<Vegetable> => {
    await delay(400);
    const db = getDB();
    const index = db.vegetablesDB.findIndex(v => v.id === veg.id);
    if (index !== -1) {
        db.vegetablesDB[index] = veg;
        setDB(db);
        console.log("API: Updated vegetable.", veg);
        return veg;
    }
    throw new Error("Vegetable not found");
};

export const deleteVegetable = async (vegId: number): Promise<{status: string}> => {
    await delay(400);
    const db = getDB();
    const index = db.vegetablesDB.findIndex(v => v.id === vegId);
    if (index !== -1) {
        db.vegetablesDB.splice(index, 1);
        setDB(db);
    }
    console.log(`API: Deleted vegetable with id: ${vegId}`);
    return { status: 'success' };
};
