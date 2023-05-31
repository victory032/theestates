export default (num) => {
  const string = num.toString() ?? '0'
  return !string.includes('.') ? 0 : string.split('.')[1]?.length
}