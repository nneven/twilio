# Download the helper library from https://www.twilio.com/docs/python/install
import os
from dotenv import load_dotenv
from twilio.rest import Client


# Load environment variables from .env file
load_dotenv()

# Find your Account SID and Auth Token at twilio.com/console
# and set the environment variables. See http://twil.io/secure
account_sid = os.environ['ACCOUNT_SID']
auth_token = os.environ['AUTH_TOKEN']
client = Client(account_sid, auth_token)

call = client.calls.create(
                        url='http://demo.twilio.com/docs/voice.xml',
                        to='+13106992507',
                        from_='+18557852680'
                    )

print(call.sid)
