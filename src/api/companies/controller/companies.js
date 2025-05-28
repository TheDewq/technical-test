import {KEYS} from "../../../utils/constants.js";
import hubspot from "@hubspot/api-client";

export class Companies {
  static migrate(req, res) {
    // send status to HubSpot
    res.sendStatus(204)

    const data = req.body[0];

    // verify if body isn't empty
    if (data == null) return res.status(400).json({ message: "missing data" });

    console.log("Request type", data);

    // Determine the subscription type to execute the corresponding function
    if (data.subscriptionType == "company.creation") {
        Companies.create(data.objectId);
    }

    if (data.subscriptionType == "company.propertyChange") {
        const {objectId, propertyName, propertyValue} = data
        Companies.update(objectId, propertyName, propertyValue);
        
    }
  }

  static async create(objId) {
    try {
        console.log("Creating company")

        //retrieve company information from origin
        const originHubspotClient = new hubspot.Client({"accessToken":KEYS.ORIGIN.COMPANIES.CREATE});

        //company properties
        const companyId = objId;
        const allProperties = ["name", "dimension", "location_id", "location_type","creation_date"];


        const apiResponse = await originHubspotClient.crm.companies.basicApi.getById(companyId, allProperties);


        //delete certain data
        const {name, dimension, location_id, location_type, creation_date} = apiResponse.properties
        //create company in mirror CMS



        const targetHubspotClient = new hubspot.Client({"accessToken": KEYS.TARGET});

        
        const SimplePublicObjectInputForCreate = { properties: {name, dimension, location_id, location_type, creation_date} };

        
        const apiResponse2 = await targetHubspotClient.crm.companies.basicApi.create(SimplePublicObjectInputForCreate);

        console.log("Company successfully migrated")
        
        return
        
    } catch (error) {
        console.error("COMPANY CREATE ERROR", error)
    }
  }

  static async update(objId, property, value){
    console.log("update company values ", objId, property, value)
        try {
            console.log("Updating company")

            //find location ID of company
            const originHubspotClient = new hubspot.Client({"accessToken":KEYS.ORIGIN.COMPANIES.UPDATE});

            //company properties
            const allProperties = ["location_id"];


            const apiResponse = await originHubspotClient.crm.companies.basicApi.getById(objId, allProperties);


            //delete certain data
            const {location_id} = apiResponse.properties

            
            //Find target company

            const hubspotClient = new hubspot.Client({"accessToken":KEYS.TARGET});


            const PublicObjectSearchRequest = {
                filterGroups: [
                    {
                        filters:[
                            {
                                "propertyName": "location_id",
                                "operator": "CONTAINS_TOKEN",
                                "value": location_id
                            }
                        ]
                    }
                ]    
            };

            const foundCompany = await hubspotClient.crm.companies.searchApi.doSearch(PublicObjectSearchRequest);
            
            
            //update company data

            const properties = {}
            properties[property] = value
            const SimplePublicObjectInput = { properties };
            const companyId = foundCompany.results[0].id;

            
            const finalResponse = await hubspotClient.crm.companies.basicApi.update(companyId, SimplePublicObjectInput);

            console.log("company successfully updated")
            
            return
            
        } catch (error) {
            console.error("COMPANY UPDATE ERROR", error)
        }
  }
}
