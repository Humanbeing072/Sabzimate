// FIX: Update import paths to use the common directory
import { Vegetable, User } from '../common/types';
import { VEGETABLES } from './vegetables';

// Making a deep copy to avoid modifying the original constant array
export let vegetablesDB: Vegetable[] = JSON.parse(JSON.stringify(VEGETABLES));

// This will store users who have confirmed 'YES' for delivery
export let deliveryConfirmationsDB: User[] = [];