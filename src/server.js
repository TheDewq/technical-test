console.log("INITIALIZING SERVER")

//required modules import

import express from "express"
import morgan from "morgan"
import { PORT } from "./utils/constants.js"
import companiesRoutes from "./api/companies/routes/companies.routes.js"
import contactsRoutes from "./api/contacts/routes/contacts.routes.js"
import cors from "cors"
import dotenv from 'dotenv';


//initialize app

const app = express()
dotenv.config();

//middlewares
app.use(express.json())
app.use(morgan("dev"))
app.use(cors({origin: "*"}))

//set port for server listening
app.listen(PORT, "0.0.0.0")
console.info("SERVER ON PORT "+PORT)

//mount routes

app.use("/companies", companiesRoutes)

app.use("/contacts", contactsRoutes)
