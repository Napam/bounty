import axios from 'axios'
const headers = {
  'Harvest-Account-ID': 612538,
  'Authorization': 'Bearer 2819713.pt.jXoa1h9By8c_qrOdFuqGtwJpM3v9zJB61RclThVmMnacUtmdkJnFSALiQxBgECP24Crh650j9SR766VrhYlLkQ'
}

async function get(url) {
  return (await axios.get(url, { headers })).data
}

function* timeEntryGeneratorMock() {
  const data = require('./data')
  for (timeEntry of data.time_entries)
    yield timeEntry
}

async function* timeEntryGenerator() {
  let res = await get('https://api.harvestapp.com/v2/time_entries')
  do for (timeEntry of res.time_entries) yield timeEntry
  while (res.links.next && (res = await get(res.links.next)))
}

const taskLeavePaid = {
  task: {
    id: 17810723,
    name: 'Leave - Paid'
  }
}

function iterator(config) {

}

export default {
  iterator,
}

