const iwconfig = require('wireless-tools/iwconfig')

iwconfig.status((err, status) => {
  console.log(status)
})
