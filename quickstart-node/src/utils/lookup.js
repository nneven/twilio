import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

client.lookups.v2
  .phoneNumbers("+13106992507")
  .fetch({ fields: "caller_name,line_type_intelligence" })
  .then((phone_number) => console.log(phone_number));
