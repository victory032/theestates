export default async (url, filename) => {
	var el = document.createElement('a')
	el.setAttribute('href', url)
	el.setAttribute('download', filename)
	document.body.appendChild(el)
 	el.click()
	el.remove()
}