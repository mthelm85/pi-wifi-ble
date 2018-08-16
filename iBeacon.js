const bleno = require('bleno')

const uuid = '759ac907-aa8c-4b76-9f89-22db6544cbf9'
const minor = 2
const major = 1
const tx_power = -60

console.log('Starting bleno...')

bleno.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    console.log('Starting broadcast...')
    bleno.startAdvertisingIBeacon(uuid, major, minor, tx_power, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log(`Broadcasting as iBeacon uuid:${uuid}, major: ${major}, minor: ${minor}`)
      }
    })
  } else {
    console.log('Stopping broadcast...')
    bleno.stopAdvertising()
  }
})
