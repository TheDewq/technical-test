import {KEYS} from "../../../utils/constants.js";
import hubspot from "@hubspot/api-client";

export class Companies {
  static migrate(req, res) {
    // send status to HubSpot
    res.sendStatus(204);

    const data = req.body[0];

    // verify if body isn't empty
    if (data == null) return res.status(400).json({ message: "missing data" });

    console.log("tipo de request", data);

    // Determine the subscription type to execute the corresponding function
    if (data.subscriptionType == "company.creation") {
        Companies.create(data.objectId);
    }
  }

  static async create(objId) {
    try {
        console.log("Creating company")
        //retrieve company information from origin
        const originHubspotClient = new hubspot.Client({"accessToken":KEYS.ORIGIN});

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

        console.log(JSON.stringify(apiResponse2, null, 2));
          
        
    } catch (error) {
        console.error("COMPANY CREATE ERROR", error)
    }
  }
}
