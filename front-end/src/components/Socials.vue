<script setup>
import IconTwitter from '@/assets/icons/twitter.svg'
import IconDiscord from '@/assets/icons/discord.svg'
import IconMedium from '@/assets/icons/medium.svg'
import IconGitbook from '@/assets/icons/gitbook.svg'

const socials = [
  {
    icon: IconTwitter,
    href: 'https://twitter.com/TheEstatesNFT'
  },
  {
    icon: IconGitbook,
    href: 'https://whitepaper.theestates.io/the-project/welcome-to-the-estates-im-knot'
  },
  {
    icon: IconDiscord,
    href: 'http://discord.gg/theestates'
  },
  {
    icon: IconMedium,
    href: 'https://medium.com/@theestates/the-estates-de0a64e7ef92'
  }
]
</script>

<template>
  <div class="inline-flex items-center gap-6">
    <a
      v-for="({ href, icon }, index) in socials" :key="index"
      :href="href"
      target="_blank"
      class="text-white transition hover:text-white/70 active:text-white"
    >
      <component
        :is="icon"
        class="w-6 h-6"
      />
    </a>
  </div>
</template>