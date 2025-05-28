import { KEYS } from "../../../utils/constants.js";
import hubspot from "@hubspot/api-client"

export class Contacts{
    static migrate(req, res) {
    
    res.sendStatus(204)

    const data = req.body[0];

    // verify if body isn't empty
    if (data == null) return res.status(400).json({ message: "missing data" });

    console.log("Request type", data);

    // Determine the subscription type to execute the corresponding function
    if (data.subscriptionType == "contact.creation") {
        Contacts.create(data.objectId);
    }

    if (data.subscriptionType == "contact.propertyChange") {
        const {objectId, propertyName, propertyValue} = data
        Contacts.update(objectId, propertyName, propertyValue);

    }

    if(data.subscriptionType == "contact.associationChange" && !data.associationRemoved){
        const {fromObjectId} = data
        Contacts.modifyAssociation(fromObjectId);
    }

    if(data.subscriptionType == "contact.associationChange" && data.associationRemoved){
        const {fromObjectId, toObjectId} = data
        Contacts.deleteAssociation(fromObjectId, toObjectId)

    }
}

    static async create(objId) {
        try {
            console.log("Creating contact")
            
            //retrieve contact information from origin
            const originHubspotClient = new hubspot.Client({"accessToken":KEYS.ORIGIN.CONTACTS.CREATE});
    
            //contact properties
            const allProperties = ["firstname", "lastname", "character_id", "status_character","character_species","character_gender"];
            
            const apiResponse = await originHubspotClient.crm.contacts.basicApi.getById(objId, allProperties);
    
    
            //delete certain data
            const {firstname, lastname, character_id, status_character,character_species,character_gender} = apiResponse.properties

            //create contact in mirror CMS

    
            const targetHubspotClient = new hubspot.Client({"accessToken": KEYS.TARGET});
    
            
            const SimplePublicObjectInputForCreate = { properties: {firstname, lastname, character_id, status_character,character_species,character_gender} };
    
            
            const apiResponse2 = await targetHubspotClient.crm.contacts.basicApi.create(SimplePublicObjectInputForCreate);

            console.log("response from target", apiResponse2)
    
            console.log("Contact successfully migrated")

            //establish association between contact and company


           

            //make association
            Contacts.modifyAssociation(objId, apiResponse2.id)
            
            
            
            return
            
        } catch (error) {
            console.error("CONTACT CREATE ERROR", error.body)
        }
    }

    static async update(objId, property, value){
        console.log("update contact values ", objId, property, value)
            try {
                console.log("Updating contact")
    
                //find location ID of contact
                const originHubspotClient = new hubspot.Client({"accessToken":KEYS.ORIGIN.CONTACTS.UPDATE});
    
                //contacts properties   
                const allProperties = ["character_id"];
    
    
                const apiResponse = await originHubspotClient.crm.contacts.basicApi.getById(objId, allProperties);
    

                const {character_id} = apiResponse.properties
    
                
                //Find target company
    
                const hubspotClient = new hubspot.Client({"accessToken":KEYS.TARGET});
    
    
                const PublicObjectSearchRequest = {
                    filterGroups: [
                        {
                            filters:[
                                {
                                    "propertyName": "character_id",
                                    "operator": "CONTAINS_TOKEN",
                                    "value": character_id
                                }
                            ]
                        }
                    ]    
                };
    
                const foundContact = await hubspotClient.crm.contacts.searchApi.doSearch(PublicObjectSearchRequest);
                
                
                //update contact data
    
                const properties = {}
                properties[property] = value
                const SimplePublicObjectInput = { properties };
                const companyId = foundContact.results[0].id;
    
                
                const finalResponse = await hubspotClient.crm.contacts.basicApi.update(companyId, SimplePublicObjectInput);
    
                console.log("contact successfully updated")
                
                return
                
            } catch (error) {
                console.error("CONTACT UPDATE ERROR", error.body)
            }
    }

    static async modifyAssociation(ContactId, TargetContactId = null, discard=false){
        console.log("Making association")
        //parametters verification
        try {
        if(!ContactId) throw new Error("Missing data in makeAssocciation method")
        
        const originHubspotClient = new hubspot.Client({"accessToken":KEYS.ORIGIN.CONTACTS.CREATE})
        
        //get origin contact data
        console.log("step 1")

        const associations = ["companies"]

        const apiResponse = await originHubspotClient.crm.contacts.basicApi.getById(ContactId, ["character_id"], undefined, associations);


         //get company id in target
         console.log("step 2")
         if (!apiResponse.associations?.companies?.results?.length) {
                throw new Error("No associated company found for the contact");
            }

        const origin_company_id = apiResponse.associations.companies.results[0].id

        //get origin company data
        console.log("step 3")

        const companyHubspotClient = new hubspot.Client({"accessToken": KEYS.ORIGIN.COMPANIES.UPDATE})

        const response = await companyHubspotClient.crm.companies.basicApi.getById(origin_company_id, ["name", "dimension", "creation_date", "location_type", "location_id"]);

        const origin_company_properties = response.properties


        //find id of company from target
        console.log("step 4")

        const targetHubspotClient = new hubspot.Client({"accessToken": KEYS.TARGET})

         const PublicObjectSearchRequest = {
                filterGroups: [
                    {
                        filters:[
                            {
                                "propertyName": "location_id",
                                "operator": "CONTAINS_TOKEN",
                                "value": origin_company_properties.location_id
                            }
                        ]
                    }
                ]    
            };

        console.log("step 5")
        const response2 = await targetHubspotClient.crm.companies.searchApi.doSearch(PublicObjectSearchRequest)

        const TargetCompanyId = response2.results[0].id
        let finalTargetContactId = TargetContactId

        if(finalTargetContactId == null){
            const requestData = {
                filterGroups: [
                    {
                        filters:[
                            {
                                "propertyName": "character_id",
                                "operator": "CONTAINS_TOKEN",
                                "value": apiResponse.properties.character_id
                            }
                        ]
                    }
                ]    
            };

            

            const response = await targetHubspotClient.crm.contacts.searchApi.doSearch(requestData)

            console.log("respuesta del server xD", response)

            finalTargetContactId = response.results[0].id
        }
        console.log("step 6")

        //contact is "from" and company is "to"

        const fromObjectType = "0-1"
        const toObjectType = "0-2"

        const AssociationSpec = [
            {
                "associationCategory": "HUBSPOT_DEFINED",
                "associationTypeId": 1
            }
        ];
        console.log("step 7")

        if(!discard){
            const apiResponse2 = await targetHubspotClient.crm.associations.v4.basicApi.create(fromObjectType, finalTargetContactId, toObjectType, TargetCompanyId, AssociationSpec);



            console.log("Association made successfully")
        }else{
             const apiResponse2 = await targetHubspotClient.crm.associations.v4.basicApi.archive(fromObjectType, TargetContactId, toObjectType, TargetCompanyId);


            console.log("Association deleted successfully")
        }

        console.log("step 8")

        } catch (error) {
            console.error("MODIFY ASSOCIATION ERROR", error.body || error)
        }
        
    }

    static async deleteAssociation(originContactId, originCompanyId){
        try {

            


            //step 1: get origin company id (location id) 
            const originCompanyHubspot = new hubspot.Client({"accessToken": KEYS.ORIGIN.COMPANIES.UPDATE})
            const companyResponse = await originCompanyHubspot.crm.companies.basicApi.getById(originCompanyId,["location_id"])
            const TargetCompanyId = companyResponse.properties.location_id

            console.log("step 1 ", TargetCompanyId)

            //step 2: get origin contact id (character_id)
            const originContactHubspot = new hubspot.Client({"accessToken":KEYS.ORIGIN.CONTACTS.UPDATE})
            const contactResponse = await originContactHubspot.crm.contacts.basicApi.getById(originContactId,["character_id"])
            const TargetContactId = contactResponse.properties.character_id

            console.log("step 2", TargetContactId)

            //step 3: find company id (real id) in target
            const targetHubspot = new hubspot.Client({"accessToken":KEYS.TARGET})

             const companyParameters = {
                filterGroups: [
                    {
                        filters:[
                            {
                                "propertyName": "location_id",
                                "operator": "CONTAINS_TOKEN",
                                "value": TargetCompanyId
                            }
                        ]
                    }
                ]    
            };
            const responseFoundCompany = await targetHubspot.crm.companies.searchApi.doSearch(companyParameters);
            const TargetCompanyData = responseFoundCompany.results[0].id
            console.log("step 3", TargetCompanyData)

            //step 4: find contact id (real id) in target

            const contactParameters = {
                filterGroups: [
                    {
                        filters:[
                            {
                                "propertyName": "character_id",
                                "operator": "CONTAINS_TOKEN",
                                "value": TargetContactId
                            }
                        ]
                    }
                ]    
            };

            const responseFoundContact = await targetHubspot.crm.contacts.searchApi.doSearch(contactParameters);
            const TargetContactData = responseFoundContact.results[0].id
            console.log("step 4", TargetContactData)

            //step 5: archive association in target
            const batchInput = {
                inputs: [
                    {"_from":{
                        "id": TargetContactData
                    },
                    "to":[{
                        "id": TargetCompanyData
                    }]
                }
                    
                ]
            }
            const response = await targetHubspot.crm.associations.v4.batchApi.archive("0-1", "0-2", batchInput)

            console.log("step 5", response)

            return
            
            
        } catch (error) {
            console.error("DELETE ASSOCIATION ERROR", error.body || error)
        }
    }
  }
