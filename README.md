
# Migration and Integration Web Service

A simple web service that migrates data from the Rick and Morty API to HubSpot CRM and mirrors it to another HubSpot account.


## Installation

1. You must have 2 Hubspot Accounts (one for origin and one for mirror), in contacts sections you add the next properties:
| **Property Name**      | **Internal Name**     | **Type**            | **Values**                        |
|------------------------|------------------------|---------------------|-----------------------------------|
| Character ID           | character_id           | Single Line Text    | N/A                               |
| First Name             | firstname              | Single Line Text    | N/A                               |
| Last Name              | lastname               | Single Line Text    | N/A                               |
| Status Character       | status_character       | Dropdown            | Alive, Dead, unknown              |
| Character's Species    | character_species      | Single Line Text    | N/A                               |
| Character's Gender     | character_gender       | Dropdown            | Female, Male, Genderless, unknown |


then, you must add the next properties in Company section:
| Property Name    | Internal Name   | Type              | Values |
|------------------|-----------------|-------------------|--------|
| Location ID      | location_id     | Single Line Text  | N/A    |
| Company name     | name            | Single Line Text  | N/A    |
| Location's Type  | location_type   | Single Line Text  | N/A    |
| Dimension        | dimension       | Single Line Text  | N/A    |
| Creation Date    | creation_date   | Date Picker       | N/A    |

2. go to settings > Integrations > private apps and create 4 private apps with next schema:
| Operation       | Required Permissions                                      | Event Type                |
|-----------------|----------------------------------------------------------|---------------------------|
| Contact Create  | crm.objects.contacts.read crm.objects.contacts.write     | contact.creation          |
| Contact Update  | crm.objects.contacts.read crm.objects.contacts.write     | contact.propertyChange contact.associationChange |
| Company Create  | crm.objects.companies.read crm.objects.companies.write   | company.creation          |
| Company Update  | crm.objects.companies.read crm.objects.companies.write   | company.propertyChange    |

3. if you want to use this localy, you must clone this repository into any directory and get in there.

```bash
  git clone https://github.com/TheDewq/technical-test
  cd technical-test
```

4. Install the required dependencies .

```bash
  npm i
```
5. create an .env file a put every single token from each hubspot account. (check it out on private apps section)
```.env
HUBSPOT_ORIGIN_COMPANIES_CREATE=pat-na1-xxxxx-xxxxx-xxxxx-xxxxx-xxxxxxxxxx
HUBSPOT_ORIGIN_COMPANIES_UPDATE=pat-na1-xxxxx-xxxxx-xxxxx-xxxxx-xxxxxxxxxx
HUBSPOT_TARGET=pat-na1-xxxxx-xxxxx-xxxxx-xxxxx-xxxxxxxxxx
HUBSPOT_ORIGIN_CONTACTS_CREATE=pat-na1-xxxxx-xxxxx-xxxxx-xxxxx-xxxxxxxxxx
HUBSPOT_ORIGIN_CONTACTS_UPDATE=pat-na1-xxxxx-xxxxx-xxxxx-xxxxx-xxxxxxxxxx
```

6. Start the service

```bash
  npm run start 
```
Or, start it in development mode (with hot reload):
```bash
  npm run dev 
```

ADVICE: You must use a service that provides TLS/SSL certification.

## Endpoints

#### Start migration from rick and morty API to Hubspot origin account

```http
  GET /migrate
```

#### Contacts webhook

```http
  POST /contacts
```

#### Companies webhook

```http
  POST /companies
```

#### Aditional endpoints...
Migrates only locations

```http
  POST /migrate_locations
```

Migrates only contacts

```http
  POST /migrate_contacts
```

## Class reference

#### RickAndMorty

| method | parameters | Response Type | Description |
|--------|------------|---------------|-------------|
|Migrate|N/A|void| Start whole migration|
|MigrateLocations|N/A|void| Migrate locations only|
|MigrateContacts|N/A|void| Migrate contacts only|
|isPrimeNumber|n:int|Boolean| Returns true if number is a prime number|

#### OriginHubspot
| method | parameters | Response Type | Description |
|--------|------------|---------------|-------------|
|createLocation|properties:json|int| creates a new locations on origin and returns location id|
|searchLocation|propertyName:String propertyValue:String| int| find a location by a propety value and returns location id|
|createContact|properties:json companyId:int| int | Creates a new contact, associate it with a company and returns character id|

#### Companies
Hubspot webhook ONLY
| method | parameters | Response Type | Description |
|--------|------------|---------------|-------------|
|migrate|N/A|void|Determine the subscription type to execute the corresponding function|
|create|objId:int|void|Creates a new company into Hubspot Mirror from Hubspot Origing account|
|update|objId:int propety:String value:String|void|Update company's propety|

#### Contacts
Hubspot webhook ONLY
| method | parameters | Response Type | Description |
|--------|------------|---------------|-------------|
|migrate|N/A|void|Determine the subscription type to execute the corresponding function|
|create|objId:int|void|Creates a new contact into Hubspot Mirror from Hubspot Origing account|
|update|objId:int propety:String value:String|void|Update contact's propety|
|modifyAssociation|ContactId:int TargetContactId:int|void|Make an asocciation between contact and company on Hubspot Mirror Account|
|deleteAssociation|originContactId:int originCompanyId:int|void|Delete an asocciation between contact and company on Hubspot Mirror Account|

#### Thanks for read this!

pls hire me :( 




