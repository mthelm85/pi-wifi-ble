const bleno = require('bleno')

const get_creds_service_uuid = '0fd8130a-94de-4f55-a6e8-ad06fa18cfef'
const ssid_uuid = '90727c61-02c5-4f38-b6c4-63d94f9ac636'
const pass_uuid = '4ff60c08-ec28-4eda-b8ea-4ed4f8849738'
const response_uuid = '1b32b1be-7a81-46de-ac84-e746aae8916f'

class argumentCharacteristic extends bleno.Characteristic {
  constructor(uuid, name) {
    super({
      uuid: uuid,
      properties: ['write'],
      value: null,
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: name
        })
      ]
    })
    this.argument = 0
    this.name = name
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    try {
      if(data.length != 1) {
        callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH)
        return
      }
      this.argument = data
      console.log(`Argument ${this.name} is now ${this.argument}`)
      callback(this.RESULT_SUCCESS)
    } catch (err) {
      console.log(err)
      callback(this.RESULT_UNLIKELY_ERROR)
    }
  }
}

class responseCharacteristic extends bleno.Characteristic {
    constructor(sendResponse) {
        super({
            uuid: response_uuid,
            properties: ["read"],
            value: null,
            descriptors: [
                new bleno.Descriptor({
                    uuid: "2901",
                    value: "Connection response"
                  })
            ]
        })
        this.sendResponse = sendResponse
    }
    onReadRequest(offset, callback) {
        try {
            const result = this.sendResponse()
            console.log(`Returning response: ${response}`)
            let data = new Buffer(1)
            data.writeUInt8(response, 0)
            callback(this.RESULT_SUCCESS, data)
        } catch (err) {
            console.error(err)
            callback(this.RESULT_UNLIKELY_ERROR)
        }
    }
}

bleno.on("advertisingStart", err => {
    console.log("Configuring services...")

    if(err) {
        console.error(err)
        return
    }
    let ssid = new argumentCharacteristic(ssid_uuid, "SSID")
    let pass = new argumentCharacteristic(pass_uuid, "PASS")
    let response = new responseCharacteristic(() => ssid.argument + pass.argument)
    let getCredsService = new bleno.PrimaryService({
        uuid: get_creds_service_uuid,
        characteristics: [
            ssid,
            pass,
            response
        ]
    })
    bleno.setServices([getCredsService], err => {
        if(err)
            console.log(err)
        else
            console.log("Services configured")
    })
})
bleno.on("stateChange", state => {
    if (state === "poweredOn") {

        bleno.startAdvertising("Kegmo", [get_creds_service_uuid], err => {
            if (err) console.log(err)
        })
    } else {
        console.log("Stopping...")
        bleno.stopAdvertising()
    }
})
