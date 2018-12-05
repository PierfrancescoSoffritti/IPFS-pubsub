const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')

const portOffset = new Number(process.argv[2])

const ipfs = new IPFS({
  repo: getRandomRepo(),
  EXPERIMENTAL: {
    pubsub: true
  }, 
  config: {
    Addresses: { 
      Swarm: [ 
        `/ip4/0.0.0.0/tcp/${4002+portOffset}`, 
        `/ip4/127.0.0.1/tcp/${4003+portOffset}/ws` 
      ], 
      API: `/ip4/127.0.0.1/tcp/${5002+portOffset}`, 
      Gateway: `/ip4/127.0.0.1/tcp/${9090+portOffset}`
    }
  }
})

ipfs.once('ready', () => ipfs.id( (error, info) => {
  if(error) console.log(error)
  console.log(`IPFS node ready ${info.id}`)

  const roomName = 'ipfs-pubsub-demo'
  const room = Room(ipfs, roomName)

  room.on('peer joined', peer => console.log(`peer ${peer} joined`))
  room.on('peer left', peer => console.log(`peer ${peer} left`))

  // receive message
  room.on('message', message => console.log(`Received a message from ${message.from}: ${message.data.toString()}`))

  // send message to peer
  room.on('peer joined', peer => room.sendTo(peer, `Hello ${peer}`))

  // broadcast message
  setInterval( () => room.broadcast('hey, this is a broadcast message!'), 2000)

} ))

ipfs.on('error', error => console.log(error))

function getRandomRepo() {
  return `ipfs/pubsub-demo/${Math.random()}`
}