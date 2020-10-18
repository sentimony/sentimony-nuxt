<template>
  <section class="Ddosguard">
    <meta
      v-if="redirect"
      http-equiv="refresh"
      :content="'0; URL=' + link"
    />
    <div class="DdosguardTitle">DDoS Guard</div>
    <div v-if="item.cover" class="DdosguardAnimation">
      <div class="DdosguardCoverholder">
        <img
          :src="'https://content.sentimony.com/assets/img/items/small/' + item.slug +'.jpg'"
          :srcset="'https://content.sentimony.com/assets/img/releases/small/' + item.slug +'.jpg 1x, https://content.sentimony.com/assets/img/releases/small-retina/' + item.slug +'.jpg 2x'"
          :alt="item.title"
        />
      </div>
    </div>
    <h1>{{ item.title }} on {{ title }}</h1>
    <p class="DdosguardText">
      Redirecting
      <span v-if="!redirect"> . . . {{ counter }} sec</span>
      <span v-if="redirect"> to <a :href="link">{{ link }}</a></span>
    </p>
  </section>
</template>


<script>
  export default {
    props: [
      'item',
      'title',
      'link'
    ],
    data () {
      return {
        counter: 3,
        redirect: false,
      }
    },
    methods: {
      timeout() {
        setTimeout( ()=> {
           this.redirect = true
        }, 3000)
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
  @import '../node_modules/coriolan-ui/tools/variables'
  @import '../node_modules/coriolan-ui/mixins/media'


  .Ddosguard
    // position: absolute
    // width: 100%
    // height: 70%
    display: flex
    // justify-content: center
    justify-content: flex-start
    align-items: center
    flex-direction: column
    padding: 1rem
    box-sizing: border-box
    text-align: center
    // font-size: 18px
    // line-height: 1.5
    font-family: 'Montserrat', sans-serif
    // background-color: #eee
    color: #333
    @include media(M)
      padding-top: 8rem

    &Title
      font-size: 24px
      line-height: 1.2
      // color: green
      margin-bottom: 1rem
      background-color: rgba(#fff,.5)
      position: relative
      padding: 0 .5em
      position: relative
      z-index: 1
      @include media(M)
        font-size: 40px

    &Animation
      position: relative
      border-radius: 500px
      width: 80px
      height: 80px
      margin-bottom: 1rem
      @include media(M)
        height: 120px
        width: 120px

      &:before
        position: absolute
        content: ''
        top: 0
        left: 0
        width: 100%
        height: 100%
        border-radius: 50%
        box-shadow: 0 0 0
        @include media(M)
          animation: 2s ease infinite pulseShadow

      &:after
        position: absolute
        content: ''
        top: 0
        left: 0
        width: 100%
        height: 100%
        border-radius: 50%
        box-shadow: 0 0 0
        @include media(M)
          animation: 2s ease-in-out .5s infinite pulseShadow

    &Coverholder
      overflow: hidden
      border-radius: 500px
      height: 80px
      width: 80px
      // border: 2px solid #999
      // background-color: #eee
      box-sizing: border-box
      @include media(M)
        background-color: #999
        height: 120px
        width: 120px

    img
      display: block
      width: 100%
      height: auto
      border-radius: 500px
      animation: 2s ease-in-out infinite pulseScale

    h1
      font-size: 18px
      line-height: 1.2
      background-color: rgba(#fff,.5)
      position: relative
      padding: 0 .5em
      @include media(M)
        font-size: 30px

    &Text
      position: relative
      background-color: rgba(#fff,.5)
      padding: 0 .5em

  @keyframes pulseShadow
    0%
      box-shadow: 0 0 0 0 rgba(#999, 1)
    100%
      box-shadow: 0 0 0 280px rgba(#999, 0)

  @keyframes pulseScale
    0%
      transform: scale(1)
    10%
      transform: scale(.9)
    20%
      transform: scale(1)
    30%
      transform: scale(.9)
    40%
      transform: scale(1)
</style>
