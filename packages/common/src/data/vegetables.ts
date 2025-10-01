import { Language, Vegetable } from '../types';

export const VEGETABLES: Vegetable[] = [
  // FIX: Changed 'id' from number to string to match the Vegetable type.
  { id: '1', name: { [Language.EN]: 'Tomato', [Language.HI]: 'टमाटर' }, price: 40, unit: { [Language.EN]: 'kg', [Language.HI]: 'किलो' }, image: 'https://picsum.photos/id/1080/400/300' },
  // FIX: Changed 'id' from number to string to match the Vegetable type.
  { id: '2', name: { [Language.EN]: 'Potato', [Language.HI]: 'आलू' }, price: 30, unit: { [Language.EN]: 'kg', [Language.HI]: 'किलो' }, image: 'https://picsum.photos/id/292/400/300' },
  // FIX: Changed 'id' from number to string to match the Vegetable type.
  { id: '3', name: { [Language.EN]: 'Onion', [Language.HI]: 'प्याज' }, price: 35, unit: { [Language.EN]: 'kg', [Language.HI]: 'किलो' }, image: 'https://picsum.photos/id/106/400/300' },
  // FIX: Changed 'id' from number to string to match the Vegetable type.
  { id: '4', name: { [Language.EN]: 'Carrot', [Language.HI]: 'गाजर' }, price: 50, unit: { [Language.EN]: 'kg', [Language.HI]: 'किलो' }, image: 'https://picsum.photos/id/1078/400/300' },
  // FIX: Changed 'id' from number to string to match the Vegetable type.
  { id: '5', name: { [Language.EN]: 'Cucumber', [Language.HI]: 'खीरा' }, price: 25, unit: { [Language.EN]: 'kg', [Language.HI]: 'किलो' }, image: 'https://picsum.photos/id/101/400/300' },
  // FIX: Changed 'id' from number to string to match the Vegetable type.
  { id: '6', name: { [Language.EN]: 'Spinach', [Language.HI]: 'पालक' }, price: 20, unit: { [Language.EN]: 'bunch', [Language.HI]: 'गुच्छा' }, image: 'https://picsum.photos/id/128/400/300' },
  // FIX: Changed 'id' from number to string to match the Vegetable type.
  { id: '7', name: { [Language.EN]: 'Cauliflower', [Language.HI]: 'फूलगोभी' }, price: 45, unit: { [Language.EN]: 'piece', [Language.HI]: 'टुकड़ा' }, image: 'https://picsum.photos/id/211/400/300' },
];