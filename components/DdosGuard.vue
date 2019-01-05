<template>
  <section class="Ddosguard">
    <meta
      v-if="redirect"
      http-equiv="refresh"
      :content="'0; URL=' + link"
    />
    <div class="DdosguardTitle">DDoS Guard</div>
    <div class="DdosguardAnimation">
      <div class="DdosguardCoverholder">
        <img
          :src="'https://content.sentimony.com/assets/img/releases/small/' + release.cat_no + '/' + release.slug +'.jpg'"
          :srcset="'https://content.sentimony.com/assets/img/releases/small/' + release.cat_no + '/' + release.slug +'.jpg 1x, https://content.sentimony.com/assets/img/releases/small-retina/' + release.cat_no + '/' + release.slug +'.jpg 2x'"
          :alt="release.title"
        />
      </div>
    </div>
    <h1>{{ release.title }} on {{ title }}</h1>
    <div class="DdosguardText">
      Redirecting
      <span v-if="!redirect"> . . . {{ counter }} sec</span>
      <span v-if="redirect"> to <a :href="link">{{ link }}</a></span>
    </div>
  </section>
</template>


<script>
  export default {
    props: [
      'release',
      'title',
      'link'
    ],
    data () {
      return {
        counter: 6,
        redirect: false
      }
    },
    methods: {
      timeout() {
        setTimeout( ()=> {
           this.redirect = true
        }, 6000)
      },
      interval() {
        setInterval(() => {
          this.counter--
        }, 1000)
      }
    },
    mounted() {
      this.timeout()
      this.interval()
    }
  }
</script>

<style lang="sass">
  .Ddosguard
    position: absolute
    width: 100%
    height: 100%
    display: flex
    justify-content: center
    align-items: center
    flex-direction: column
    padding: 20px
    box-sizing: border-box
    text-align: center
    font-size: 18px
    line-height: 1.5
    font-family: 'Montserrat', sans-serif
    background-color: #eee
    color: #333

    &Title
      font-size: 40px
      color: #bbb
      margin-bottom: 40px

    &Animation
      position: relative
      border-radius: 500px
      width: 120px
      height: 120px

      &:before
        position: absolute
        content: ''
        top: 0
        left: 0
        width: 100%
        height: 100%
        border-radius: 50%
        animation: 2s ease infinite pulseShadow
        box-shadow: 0 0 0

      &:after
        position: absolute
        content: ''
        top: 0
        left: 0
        width: 100%
        height: 100%
        border-radius: 50%
        animation: 2s ease-in-out .5s infinite pulseShadow
        box-shadow: 0 0 0

    &Coverholder
      overflow: hidden
      border-radius: 500px
      height: 120px
      width: 120px
      border: 2px solid #999
      box-sizing: border-box

    img
      display: block
      width: 100%
      height: auto
      animation: 2s ease-in-out infinite pulseScale

    h1
      font-size: 30px
      background-color: rgba(#fff,.5)
      position: relative
      padding: 0 .75em

    &Text
      position: relative
      background-color: rgba(#fff,.5)
      padding: 0 .75em

  @keyframes pulseShadow
    0%
      box-shadow: 0 0 0 0 rgba(#999, 1)
    100%
      box-shadow: 0 0 0 280px rgba(#999, 0)

  @keyframes pulseScale
    0%
      transform: scale(1)
    10%
      transform: scale(1.05)
    20%
      transform: scale(1)
    30%
      transform: scale(1.05)
    40%
      transform: scale(1)
</style>
