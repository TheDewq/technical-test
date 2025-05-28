require('dotenv').config();

export const KEYS = {
    ORIGIN: {
        CREATE: process.env.HUBSPOT_ORIGIN_CREATE,
        UPDATE: process.env.HUBSPOT_ORIGIN_UPDATE
    },
    TARGET: process.env.HUBSPOT_TARGET
}

export const PORT = 1337

