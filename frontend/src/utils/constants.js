import UserData from '../views/plugin/UserData';

export const API_BASE_URL = 'http://localhost:8000/api/v1';
export const userId = UserData()?.user_id;

console.log(userId, 'userId from constants.js');

