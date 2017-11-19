const getExtension = (name) => {
  const split = name.split('.')
  const ext = split[split.length - 1].toLowerCase()
  if (['jpeg', 'jpg'].includes(ext)) {
    return {isJPEG: true}
  }
  if (ext === 'png') {
    return {isPNG: true}
  }
  return {}
}

module.exports = {
  getExtension
}
