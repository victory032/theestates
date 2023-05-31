const timeleft = (timestamp) => ({
  d: Math.floor(Number(timestamp) / (1000 * 60 * 60 * 24)),
  h: Math.floor((Number(timestamp) / (1000 * 60 * 60)) % 24),
  m: Math.floor((Number(timestamp) / 1000 / 60) % 60),
  s: Math.floor((Number(timestamp) / 1000) % 60)
})

export default timeleft