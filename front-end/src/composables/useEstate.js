import { inject, computed } from 'vue'
import { useAsyncState, useFetch } from '@vueuse/core'
import { useEstatesContract, useStakingContract, useApi } from '@/composables'
import { fileDownload, stringToHex } from '@/utils'
import { notify } from 'notiwind'

export default (id, options = { resetOnExecute: false, immediate: true }) => {
  const wallet = inject('wallet')
  const { estateGeneration, tokenURI, ownerOf } = useEstatesContract() 
  const { stakes } = useStakingContract()

  const getToken = async () => {
    try {
      const [generation, {owner: owner_stake, staked_at}, metadata, owner] = await Promise.all([
        estateGeneration(id.value),
        stakes(id.value),
        getMetadata(id.value),
        ownerOf(id.value),
      ])
  
      return Promise.resolve({
        id: id.value,
        generation,
        owner,
        owner_stake,
        metadata,
        staked_at
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const getMetadata = async (id) => {
    try {
      const url = await tokenURI(id)
      const { data } = await useFetch(url).get().json()
      return Promise.resolve(data.value)
    } catch (error) {
      notify({
        type: 'error',
        title: 'Token data',
        text: error.message
      })
      return Promise.reject(error)
    }
  }

  const download = async (address) => {
    try {
      const api = useApi()
      const { data: { success, message, nonce } } = await api.get(`auth/nonce/${address}`)
      if (success) {
        const timestamp = new Date().getTime()
        const verifiableMessage = `Sign this unique message to prove ownership of your wallet address. \nUnique Signature ID: ${nonce}${id.value}${timestamp}`
        const signature = await wallet.provider.request({
          method: 'personal_sign',
          params: [stringToHex(verifiableMessage), address],
        })
        const { data } = await api.post(`files/${id.value}`, {
          signature,
          timestamp,
          address
        })
        const { success, message, files } = data
        if (success) {
          files.forEach(file => fileDownload(file.url, file.file_name))
          notify({
            type: 'success',
            title: `Estate #${id.value}`,
            text: 'File download succesfully started'
          })
          return Promise.resolve(files)
        } else {
          throw new Error(message)
        }
      } else {
        throw new Error(message)
      }
    } catch (error) {
      notify({
        type: 'error',
        title: `Estate #${id.value}`,
        text: error.reason ?? error.message
      })
    }
  }

  const { state: token, isLoading: isTokenLoading, isReady: isTokenReady, execute: loadToken } = useAsyncState(() => getToken(), null, options)
  const { isLoading: isTokenDownloading, execute: downloadToken } = useAsyncState((address) => download(address), null, { resetOnExecute: true, immediate: false })

  const isTokenRevealed = computed(() => Boolean(token.value?.metadata.attributes))

  return {
    token,
    isTokenLoading,
    isTokenReady,
    isTokenRevealed,
    loadToken,
    downloadToken,
    isTokenDownloading
  }
}