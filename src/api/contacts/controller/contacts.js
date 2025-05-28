import { KEYS } from "../../../utils/constants.js";
import hubspot from "@hubspot/api-client"

export class Contacts{
    static migrate(req, res) {
    // send status to HubSpot
    res.sendStatus(204)

    const data = req.body[0];

    // verify if body isn't empty
    if (data == null) return res.status(400).json({ message: "missing data" });

    console.log("Request type", data);

    // Determine the subscription type to execute the corresponding function
    if (data.subscriptionType == "contact.creation") {
        Contacts.create(data.objectId);
    }
/*
    if (data.subscriptionType == "company.propertyChange") {
        const {objectId, propertyName, propertyValue} = data
        Contacts.update(objectId, propertyName, propertyValue);
        }
    */
    }

    static async create(objId) {
        try {
            console.log("Creating contact")
            
            //retrieve contact information from origin
            const originHubspotClient = new hubspot.Client({"accessToken":KEYS.ORIGIN.CONTACTS.CREATE});
    
            //contact properties
            const allProperties = ["firstname", "lastname", "character_id", "status_character","character_species","character_gender"];
            const associations = ["companies"]
    
            const apiResponse = await originHubspotClient.crm.contacts.basicApi.getById(objId, allProperties, undefined, associations);

            
    
    
            //delete certain data
            const {firstname, lastname, character_id, status_character,character_species,character_gender} = apiResponse.properties

            //create contact in mirror CMS

    
            const targetHubspotClient = new hubspot.Client({"accessToken": KEYS.TARGET});
    
            
            const SimplePublicObjectInputForCreate = { properties: {firstname, lastname, character_id, status_character,character_species,character_gender} };
    
            
            const apiResponse2 = await targetHubspotClient.crm.contacts.basicApi.create(SimplePublicObjectInputForCreate);

            console.log("response from target", apiResponse2)
    
            console.log("Contact successfully migrated")

            //establish association between contact and company


            //get company id in target

            const origin_company_id = apiResponse.associations.companies.results[0].id

            //get origin company data

            const companyHubspotClient = new hubspot.Client({"accessToken": KEYS.ORIGIN.COMPANIES.UPDATE})

            const response = await companyHubspotClient.crm.companies.basicApi.getById(origin_company_id, ["name", "dimension", "creation_date", "location_type", "location_id"]);

            const origin_company_properties = response.properties

            console.log("origin_company_properties",origin_company_properties)

            //make association
            Contacts.makeAssociation()
            
            
            
            return
            
        } catch (error) {
            console.error("COMPANY CREATE ERROR", error)
        }
    }

    static async makeAssociation(ContactId, CompanyId){
        //parametters verification
        if(!CompanyId || !ContactId) throw new Error("Missing data in makeAssocciation method")

        try {
            
        hubspot.Client({"accessToken":KEYS.TARGET});

        //contact is "from" and company is "to"

        const fromObjectType = "0-1"
        const toObjectType = "0-2"


        const apiResponse = await hubspotClient.crm.associations.v4.basicApi.create(fromObjectType, ContactId, toObjectType, CompanyId);

        } catch (error) {
            throw error
        }
        
    }
  }
