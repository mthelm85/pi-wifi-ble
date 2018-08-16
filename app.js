const bleno = require('bleno')

const name = 'Kegmo'
const service_uuid = '1b0abac5-c8e1-49ac-a498-8fd9b89de591'
const ssid_uuid = '68d97c21-bc5a-40e9-b2e6-51424abd'
const passphrase_uuid = '9054fda8-f6d2-4bd8-bed3-e0f7d32ccc2f'
const response_uuid = '010796dd-cb22-4dda-bb4c-ca796cff0d4e'

// Begin advertising our BLE address
bleno.on('stateChange', state => {
  console.log(`State is: ${state}`)
  if (state === 'poweredOn') {
    bleno.startAdvertising(name, [service_uuid])
  } else {
    bleno.stopAdvertising()
  }
})

// Notification for accepted connection
bleno.on('accept', clientAddress => {
  console.log(`Connection accepted from ${clientAddress}`)
})

// Notification for disconnection
bleno.on('disconnect', clientAddress => {
  console.log(`Disconnected from address ${clientAddress}`)
})

// After we start advertising, create a new service and characteristic
bleno.on('advertisingStart', error => {
  if (error) {
    console.log(`Advertising start error: ${error}`)
  } else {
    console.log('Advertising started successfully')
    bleno.setServices([
      // Define a new service
      new bleno.PrimaryService({
        uuid: service_uuid,
        characteristics: [
          // Define SSID characteristic within the service
          new bleno.Characteristic({
            value: null,
            uuid: ssid_uuid,
            properties: ['write'],
            descriptors: [
              new bleno.Descriptor({
                uuid: '2901',
                value: 'Network Name'
              })
            ],
            onSubscribe: (maxValueSize, updateValueCallback) => {
              console.log('Device subscribed to SSID characteristic')
            },
            onUnsubscribe: () => {
              console.log('Device unsubscribed from SSID characteristic')
            },
            onWriteRequest: (data, offset, withoutResponse, callback) => {
              this.value = data
              console.log(`Write request: value = ${this.value.toString('utf-8')}`)
              callback(this.RESULT_SUCCESS)
            }
          }),
          // Define PASSPHRASE characteristic within the service
          new bleno.Characteristic({
            value: null,
            uuid: passphrase_uuid,
            properties: ['write'],
            onSubscribe: (maxValueSize, updateValueCallback) => {
              console.log('Device subscribed to PASSPHRASE characteristic')
            },
            onUnsubscribe: () => {
              console.log('Device unsubscribed from PASSPHRASE characteristic')
            },
            onWriteRequest: (data, offset, withoutResponse, callback) => {
              this.value = data
              console.log(`Write request: value = ${this.value.toString('utf-8')}`)
              callback(this.RESULT_SUCCESS)
            }
          })
        ]
      })
    ])
  }
})
