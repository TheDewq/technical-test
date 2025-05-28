import dotenv from 'dotenv';
dotenv.config();

export const KEYS = {
    ORIGIN: {
        COMPANIES:{
            CREATE: process.env.HUBSPOT_ORIGIN_COMPANIES_CREATE,
            UPDATE: process.env.HUBSPOT_ORIGIN_COMPANIES_UPDATE
        },
        CONTACTS:{
            CREATE: process.env.HUBSPOT_ORIGIN_CONTACTS_CREATE
        }
    },
    TARGET: process.env.HUBSPOT_TARGET
}

export const PORT = 1337

