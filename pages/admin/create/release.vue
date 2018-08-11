<template>
  <v-container>
    <v-layout row wrap>
      <v-flex xs12 md10 offset-md1>
        <v-card>
          <form @submit.prevent="onCreateTicket">
            <v-card-text>
              <!-- <h1>Участвовать</h1> -->
              <div>
                <!-- <img
                  src="/static/img/logos/veglas-watermark-1300x420.png"
                  class="addon"
                  style="display: none;"
                > -->
                <croppa
                  v-model="croppa"
                  :width="540"
                  :height="338"
                  :quality="2"
                  :accept="'image/*'"
                  :canvas-color="'#ccc'"
                  initial-size="contain"
                  :zoom-speed="1"
                  :placeholder="'Выберите или перетащите скриншот'"
                  :placeholder-font-size="16"
                  :placeholder-color="'rgba(0,0,0,.54)'"
                  :remove-button-size="40"
                  @file-type-mismatch="onFileTypeMismatch"
                  @file-choose="onFilePicked"
                />
              </div>
              <div>
                <v-btn
                  class="ml-0"
                  color="success"
                  large
                  :disabled="!formIsValid"
                  type="submit"
                >
                  <v-icon left>mdi-upload</v-icon>
                  Upload
                </v-btn>
              </div>
            </v-card-text>
          </form>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    data () {
      return {
        filePicked: false,
        image: null,
        croppa: {},
        isWinnerWeek: '',
        isWinnerMonth: '',
        isWinnerContest: '',
        isModerated: ''
      }
    },
    computed: {
      formIsValid () {
        return this.filePicked
      }
    },
    methods: {
      onFilePicked () {
        this.filePicked = true
      },
      onFileTypeMismatch (file) {
        alert('Фаил не валидный. Пожалуйста, загрузите валидный фаил jpg/jpeg/png.')
      },
      // onDraw: function (ctx) {
      //   ctx.save()
      //   ctx.globalAlpha = 0.7
      //   ctx.drawImage(document.querySelector('.addon'), 750, 556, 310, 100)
      //   ctx.restore()
      // },
      onCreateTicket () {
        if (!this.croppa.hasImage()) {
          alert('No image to upload')
          return
        }
        if (!this.formIsValid) {
          return
        }
        this.croppa.generateBlob((blob) => {
          var file = new File([blob], 'name.jpeg', {
            lastModifiedDate: new Date(),
            type: 'image/jpeg'
          })
          const itemData = {
            image: file,
            date: new Date(),
            isWinnerWeek: this.isWinnerWeek,
            isWinnerMonth: this.isWinnerMonth,
            isWinnerContest: this.isWinnerContest,
            isModerated: this.isModerated
          }
          this.$store.dispatch('createTicket', itemData)
          this.$router.push('/')
        }, 'image/jpeg', 0.8)
      }
    }
  }
</script>

<style>
</style>
