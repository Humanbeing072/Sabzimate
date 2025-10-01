// FIX: Use a default import for express and qualify types with the express namespace (e.g., express.Request) to prevent conflicts with global types.
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './services/prisma.service';
import { Language, Sale } from 'common';
import { OAuth2Client } from 'google-auth-library';
import { Decimal } from '@prisma/client/runtime/library';

dotenv.config();

// FIX: Read GOOGLE_CLIENT_ID from environment variables and exit if not found.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
    console.error("FATAL ERROR: GOOGLE_CLIENT_ID is not defined in the environment variables. Please create a .env file in 'packages/server' and add the variable.");
    process.exit(1);
}
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
// FIX: The type error on app.use() is resolved by correctly importing and using express types.
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// In-memory store for delivery decisions.
// NOTE: This will reset on server restart. A `DeliveryPreference` model is used in schema.
interface DeliveryDecision { userId: string; choice: 'YES' | 'NO'; date: string; }
let dailyDecisions: DeliveryDecision[] = [];


// Helper function for robust quantity parsing to decimal kg
const parseQuantityToDecimal = (quantityStr: string): Decimal => {
    const value = parseFloat(quantityStr);
    if (isNaN(value)) return new Decimal(0);

    if (quantityStr.toLowerCase().includes('kg')) {
        return new Decimal(value);
    }
    if (quantityStr.toLowerCase().includes('g')) {
        return new Decimal(value / 1000);
    }
    if ([100, 250, 500].includes(value)) {
        return new Decimal(value / 1000);
    }
    return new Decimal(value);
};

// GET all vegetables with today's price, formatted for the client
// FIX: Use Request and Response for correct types.
app.get('/api/vegetables', async (_req: express.Request, res: express.Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const vegetablesFromDB = await prisma.vegetable.findMany({
      include: {
        dailyPrices: {
          where: { date: { gte: today } },
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    const formattedVegetables = vegetablesFromDB.map((veg) => ({
      id: veg.id,
      name: { [Language.EN]: veg.name_en, [Language.HI]: veg.name_hi },
      price: veg.dailyPrices[0]?.pricePerUnit.toNumber() ?? 0,
      unit: { [Language.EN]: veg.unit_en, [Language.HI]: veg.unit_hi },
      image: veg.image,
    }));
    
    return res.json(formattedVegetables);
  } catch (error) {
    console.error("Failed to fetch vegetables:", error);
    return res.status(500).json({ error: "Failed to fetch vegetables" });
  }
});

// --- USER AUTH & MANAGEMENT ---

// FIX: Use Request and Response for correct types.
app.get('/api/users', async (_req: express.Request, res: express.Response) => {
    try {
        const users = await prisma.user.findMany();
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch users" });
    }
});

// FIX: Use Request and Response for correct types.
app.get('/api/users/phone/:phone', async (req: express.Request, res: express.Response) => {
  const { phone } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (user) return res.json(user);
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

// FIX: Use Request and Response for correct types.
app.post('/api/users', async (req: express.Request, res: express.Response) => {
  const { name, phone, address, email, googleId } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  try {
    const newUser = await prisma.user.create({ data: { name, phone, email, googleId } });
    // Address is not in the schema, but we can return it for the client
    return res.status(201).json({ ...newUser, address });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return res.status(409).json({ error: `A user with this ${field} already exists.` });
    }
    return res.status(500).json({ error: "Failed to create user" });
  }
});

// FIX: Use Request and Response for correct types.
app.post('/api/auth/google-signin', async (req: express.Request, res: express.Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'ID token is required.' });
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email || !payload.name) {
      return res.status(401).json({ error: 'Invalid Google token payload.' });
    }
    const { sub: googleId, email, name } = payload;
    const user = await prisma.user.findUnique({ where: { googleId } });
    if (user) return res.json({ user });
    return res.json({ needsOnboarding: true, profile: { name, email, googleId } });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error during Google Sign-In" });
  }
});

// --- CORE APP FEATURES ---

// FIX: Use Request and Response for correct types.
app.post('/api/delivery-decisions', async (req: express.Request, res: express.Response) => {
    const { userId, choice } = req.body;
    if (!userId || !choice) return res.status(400).json({ error: 'userId and choice are required.' });
    
    const today = new Date().toISOString().split('T')[0];
    dailyDecisions = dailyDecisions.filter(d => !(d.userId === userId && d.date === today));
    dailyDecisions.push({ userId, choice, date: today });
    
    console.log("Current decisions:", dailyDecisions);
    return res.status(200).json({ status: 'success' });
});

// FIX: Use Request and Response for correct types.
app.post('/api/orders', async (req: express.Request, res: express.Response) => {
    const { userId, items } = req.body;
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'userId and a non-empty items array are required.' });
    }

    try {
        const vegetableIds = items.map((item: {id: string}) => item.id);
        const vegetables = await prisma.vegetable.findMany({
            where: { id: { in: vegetableIds } },
            include: { dailyPrices: { orderBy: { date: 'desc' }, take: 1 } },
        });

        const orderItemsData = items.map((item: {id: string, quantity: string}) => {
            const veg = vegetables.find(v => v.id === item.id);
            const pricePerUnit = veg?.dailyPrices[0]?.pricePerUnit ?? new Decimal(0);
            const quantity = parseQuantityToDecimal(item.quantity);
            return {
                vegetableId: item.id,
                quantity,
                pricePerUnit,
                subtotal: pricePerUnit.mul(quantity),
            };
        });

        const totalAmount = orderItemsData.reduce((acc, item) => acc.add(item.subtotal), new Decimal(0));
        
        await prisma.order.create({
            data: {
                userId,
                totalAmount,
                isUrgent: true, // All orders through this endpoint are urgent
                items: { create: orderItemsData },
            },
        });
        return res.status(201).json({ status: 'success' });
    } catch (error) {
        console.error("Failed to create order:", error);
        return res.status(500).json({ error: "Failed to create order" });
    }
});

// FIX: Use Request and Response for correct types.
app.get('/api/users/:userId/bills', async (req: express.Request, res: express.Response) => {
    const { userId } = req.params;
    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: { items: { include: { vegetable: true } } },
            orderBy: { createdAt: 'desc' },
        });

        const bills = orders.map(order => ({
            date: order.createdAt.toISOString(),
            total: order.totalAmount.toNumber(),
            items: order.items.map(item => ({
                name: item.vegetable.name_en,
                quantity: item.quantity.toString() + 'kg', // Assuming quantity is stored as kg
                price: item.subtotal.toNumber(),
            })),
        }));
        return res.json(bills);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch bills" });
    }
});

// --- ADMIN ENDPOINTS ---

// FIX: Use Request and Response for correct types.
app.get('/api/deliveries/confirmed', async (_req: express.Request, res: express.Response) => {
    const today = new Date().toISOString().split('T')[0];
    const confirmedUserIds = dailyDecisions.filter(d => d.date === today && d.choice === 'YES').map(d => d.userId);
    if (confirmedUserIds.length === 0) return res.json([]);
    const users = await prisma.user.findMany({ where: { id: { in: confirmedUserIds } } });
    return res.json(users);
});

// FIX: Use Request and Response for correct types.
app.get('/api/deliveries/rejected', async (_req: express.Request, res: express.Response) => {
    const today = new Date().toISOString().split('T')[0];
    const rejectedUserIds = dailyDecisions.filter(d => d.date === today && d.choice === 'NO').map(d => d.userId);
    if (rejectedUserIds.length === 0) return res.json([]);
    const users = await prisma.user.findMany({ where: { id: { in: rejectedUserIds } } });
    return res.json(users);
});

// FIX: Use Request and Response for correct types.
app.post('/api/vegetables', async (req: express.Request, res: express.Response) => {
    const { name, price, unit, image } = req.body;
    try {
        const newVeg = await prisma.vegetable.create({
            data: {
                name_en: name[Language.EN], name_hi: name[Language.HI],
                unit_en: unit[Language.EN], unit_hi: unit[Language.HI],
                image: image,
                slug: name[Language.EN].toLowerCase().replace(/ /g, '-'),
                dailyPrices: { create: { pricePerUnit: price, date: new Date() } }
            }
        });
        return res.status(201).json(newVeg);
    } catch (error) {
        return res.status(500).json({ error: "Failed to create vegetable" });
    }
});

// FIX: Use Request and Response for correct types.
app.put('/api/vegetables/:id', async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const { name, price, unit, image } = req.body;
    try {
        const updatedVeg = await prisma.vegetable.update({
            where: { id },
            data: {
                name_en: name[Language.EN], name_hi: name[Language.HI],
                unit_en: unit[Language.EN], unit_hi: unit[Language.HI],
                image: image,
                slug: name[Language.EN].toLowerCase().replace(/ /g, '-')
            }
        });
        // Also update today's price if it exists, or create a new one
        await prisma.dailyPrice.upsert({
            where: { vegetableId_date: { vegetableId: id, date: new Date(new Date().setHours(0,0,0,0)) }},
            update: { pricePerUnit: price },
            create: { vegetableId: id, pricePerUnit: price, date: new Date() }
        })
        return res.json(updatedVeg);
    } catch (error) {
        return res.status(500).json({ error: "Failed to update vegetable" });
    }
});

// FIX: Use Request and Response for correct types.
app.delete('/api/vegetables/:id', async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    try {
        // Must delete related records first
        await prisma.dailyPrice.deleteMany({ where: { vegetableId: id } });
        await prisma.orderItem.deleteMany({ where: { vegetableId: id }});
        await prisma.vegetable.delete({ where: { id } });
        return res.json({ status: 'success' });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete vegetable" });
    }
});

// FIX: Use Request and Response for correct types.
app.get('/api/sales', async (_req: express.Request, res: express.Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: { items: { include: { vegetable: true } } }
        });
        const sales: Sale[] = orders.map(order => ({
            userId: order.userId,
            date: order.createdAt.toISOString(),
            total: order.totalAmount.toNumber(),
            items: order.items.map(item => ({
                vegetableName: item.vegetable.name_en,
                quantity: item.quantity.toString() + 'kg',
                price: item.subtotal.toNumber(),
            })),
        }));
        return res.json(sales);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch sales data" });
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});