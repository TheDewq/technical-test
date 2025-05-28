import hubspot from "@hubspot/api-client"
import { KEYS } from "../../../utils/constants.js"

export class RickAndMorty{
    static async MigrateLocations(req, res){
        try {
            //step 1: get location count and pages

            const url = "https://rickandmortyapi.com/api/location"

            const locationsResponse = await fetch(url)
            const data = await locationsResponse.json()

            const count = data.info.count
            const pages = data.info.pages

            //step 2: get every single location

            const rawLocations = []

            for(let i = 1; i <= pages; i++){
                const query = "page="+i
                const response = await fetch(url+"?"+query)
                const result = await response.json()

                //add to raw locations
                result.results.forEach(item=>rawLocations.push(item))
            }

            //step 3: format data

            const formatedData = rawLocations.map((location)=>{
                const {id, name, type, dimension, created} = location

                return {
                    location_id: id,
                    name,
                    location_type: type,
                    dimension,
                    creation_date: created.split("T")[0]
                }
            })
            //step 5: migrate data to origin

            

            const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            for(let i = 1; i <= count; i++){
                await sleep(1000)
                console.log("item ", i)
                const responseItem = await OriginHubspot.createLocation(formatedData[i-1])
                if(responseItem == i){
                    console.log("Location "+i+" uploaded successfully")
                }else{
                    throw new Error("Migration data error")
                }

            }
            
            res.status(200)

        } catch (error) {
            console.error("MIGRATE LOCATIONS ERROR", error.body || error)
        }
    }

    
}

export class OriginHubspot{
    static async createLocation(properties){
        try {
            const hubspotClient = new hubspot.Client({"accessToken": KEYS.ORIGIN.COMPANIES.CREATE})

            const SimplePublicObjectInputForCreate = {
                properties
            }

            const response = await hubspotClient.crm.companies.basicApi.create(SimplePublicObjectInputForCreate)

            return response.properties.location_id
        } catch (error) {
            console.error("CREATE LOCATION ORIGIN ERROR", error.body || error)
        }
    }
}