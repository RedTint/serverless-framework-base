# DB
This README constain details about the data available in our database

## ACCOUNTS

### Create Account

**Required Parameters:**
```
{
    "email": "some@email.com",
    "username": "SomeUser",
    "mobile_number": "639088884306"
}
```

**More Details:**
* **api_code** – **PREFIX** with ACCOUNTS#'. Generated from user email + an API_CODE_MODIFIER.
  * Validations:
    * Required
    * Unique
* **api_key**
  * Auto-generated using `generate-password` with 10 characters
  * Saved using MD5 - one-way hash.
  * Validations:
    * None
* **email**
  * Validations:
    * Required
    * Unique
    * No limit on characters
* **mobile_number**
  * Validations:
    * Required
    * Valid Mobile Number
* **password**
  * Auto-generated using `generate-password` with 10 characters
  * Saved using MD5 - one-way hash.
  * Validations:
    * None
* **account_type**
  * Default to `ACCOUNT_TYPE_CREDIT`.
  * Validations:
    * None
* **status**
  * Default to `ACCOUNT_STATUS_ENABLED`.
  * Validations:
    * None
* **date_created**
  * Auto-generated with `(new Date(dateCreated)).toISOString()`
  * Validations:
    * None
* **date_updated**
  * Auto-generated with `(new Date(dateCreated)).toISOString()`
  * Validations:
    * None
* **first_name**
  * Validations:
    * None
* **middle_name**
  * Validations:
    * None
* **last_name**
  * Validations:
    * None
* **nickname**
  * Validations:
    * None


**Code Excerpt**
```
    "email": email,
    "username": username,
    "password": password,
    "mobile_number": mobileNumber,
    "api_code": ACCOUNT_PREFIX + apiCode,
    "api_key": apiKey,
    "account_type": accountType,
    "status": status,
    "date_created": (new Date(dateCreated)).toISOString(),
    "date_updated": (new Date(dateCreated)).toISOString(),
    "first_name": firstName,
    "middle_name": middleName,
    "last_name": lastName,
    "nickname": nickname,
```
