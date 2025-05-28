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

    static async MigrateContacts(req, res){
        try {
             //step 1: get characte count and pages

            const url = "https://rickandmortyapi.com/api/character"

            const locationsResponse = await fetch(url)
            const data = await locationsResponse.json()

            const count = data.info.count
            const pages = data.info.pages

            //step 2: get every single character

            const rawCharacters = []

            for(let i = 1; i <= pages; i++){
                const query = "page="+i
                const response = await fetch(url+"?"+query)
                const result = await response.json()

                //add to raw characters
                result.results.forEach(item=>rawCharacters.push(item))
            }

            //step 3: format data

            const formatedData = rawCharacters.map((character)=>{
                const {id, name, status, species, gender, location} = character

                return {
                    location: location.name,
                    properties:{
                    character_id: id,
                    firstname: name.split(" ")[0],
                    lastname: name.split(" ")[1] || "",
                    status_character: status,
                    character_species: species,
                    character_gender: gender
                }
            }
            })

            //step 4: migrate

            const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            for(let i = 1; i <= count; i++){
                await sleep(1000)
                if(RickAndMorty.isPrimeNumber(parseInt(formatedData[i-1].properties.character_id))){
                    console.log("contact "+i+" is "+formatedData[i-1].properties.firstname)
                    const location_id = await OriginHubspot.searchLocation("name", formatedData[i-1].location)
                    const responseItem = await OriginHubspot.createContact(formatedData[i-1].properties, location_id)
                    if(formatedData[i-1].properties.character_id == responseItem){
                        console.log("contact succefully created, id = "+responseItem)
                    }
                }
            }

            

            res.status(200).json(responseItem)
        } catch (error) {
            console.error("MIGRATE CONTACTS ERROR", error.body || error)
        }
    }
    static isPrimeNumber(n) {
    if (n < 1) return false; 
    if (n == 1) return true
    if (n === 2) return true; 
    if (n % 2 === 0) return false; 

    const sqrt = Math.sqrt(n);
    for (let i = 3; i <= sqrt; i += 2) {
        if (n % i === 0) return false;
    }

    return true;
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
    static async searchLocation(propertyName, propertyValue){
        try {
            const hubspotClient = new hubspot.Client({"accessToken":KEYS.ORIGIN.COMPANIES.CREATE})

             const PublicObjectSearchRequest = {
                filterGroups: [
                    {
                        filters:[
                            {
                                "propertyName": propertyName,
                                "operator": "CONTAINS_TOKEN",
                                "value": propertyValue
                            }
                        ]
                    }
                ]    
            };

            const response = await hubspotClient.crm.companies.searchApi.doSearch(PublicObjectSearchRequest)

            return response.results[0].id
        } catch (error) {
            console.error("SEARCH ORIGIN COMPANY ERROR", error.body || error)
        }
    }
    static async createContact(properties, companyId){
        try {
            const hubspotClient = new hubspot.Client({"accessToken": KEYS.ORIGIN.CONTACTS.CREATE})

            const SimplePublicObjectInputForCreate = {
                properties,
                associations: [
                    {
                    to: { id: companyId }, 
                    types: [
                        {
                        associationCategory: "HUBSPOT_DEFINED",
                        associationTypeId: 1 // contact > company
                        }
                    ]
                    }
                ]
            };

            const response = await hubspotClient.crm.contacts.basicApi.create(SimplePublicObjectInputForCreate)

            return response.properties.character_id
        } catch (error) {
            console.error("CREATE ORIGIN CONTACT ERROR", error.body || error)
        }
    }
}