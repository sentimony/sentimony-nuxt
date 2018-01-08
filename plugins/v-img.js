import Vue from 'vue'
import VueImg from 'v-img'

const vueImgConfig = {
  // Use `alt` attribute as gallery slide title
  altAsTitle: false,
  // Display 'download' button near 'close' that opens source image in new tab
  sourceButton: true,
  // Event listener to open gallery will be applied to <img> element
  openOn: 'click',
}

Vue.use(VueImg, vueImgConfig)
