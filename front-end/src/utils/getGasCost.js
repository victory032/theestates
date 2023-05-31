import { formatEther } from '@ethersproject/units'

export default (receipt) => Number(formatEther(receipt.effectiveGasPrice.toNumber() * receipt.gasUsed.toNumber())).toFixed(6)