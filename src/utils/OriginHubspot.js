import hubspot from "@hubspot/api-client"
import { KEYS } from "./constants.js"

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