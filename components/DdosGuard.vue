<template>
  <section class="Ddosguard">
    <div class="DdosguardTitle">DDoS Guard</div>

    <div v-if="item.cover_th" class="DdosguardAnimation">
      <div class="DdosguardCoverholder">
        <img
          :src="item.cover_th"
          :alt="item.title"
        />
      </div>
    </div>

    <h1>{{ item.title }} on {{ title }}</h1>

    <p class="DdosguardText" v-if="redirect">
      Redirecting
      <!-- <span v-if="!redirect"> . . . {{ counter }} sec</span> -->
      <span> to <a :href="link">{{ link }}</a></span>
    </p>

    <p class="DdosguardText" v-if="!redirect">
      Link is coming
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
    data() {
      return {
        counter: 0,
        redirect: false,
      }
    },
    methods: {
      timeout() {
        let result
        if (this.link != '') {
          result = '✅ there is a link'
          setTimeout( ()=> {
            this.redirect = true
            window.location.href = this.link
          }, 0)

        } else {
          result = '❌ there is no link'
          this.redirect = false
        }
        console.log(result);
      },
      interval() {
        setInterval(() => {
          this.counter--
        }, 1000)
      },
    },
    mounted() {
      this.timeout()
      this.interval()
    }
  }
</script>

<style lang="sass">
  @use '@/assets/scss/coriolanVariables'
  // @use '@/assets/scss/variables'
  @use '@/assets/scss/coriolanMedia' as media


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
    @include media.media(M)
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
      @include media.media(M)
        font-size: 40px

    &Animation
      position: relative
      border-radius: 500px
      width: 80px
      height: 80px
      margin-bottom: 1rem
      @include media.media(M)
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
        @include media.media(M)
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
        @include media.media(M)
          animation: 2s ease-in-out .5s infinite pulseShadow

    &Coverholder
      overflow: hidden
      border-radius: 500px
      height: 80px
      width: 80px
      // border: 2px solid #999
      box-sizing: border-box
      @include media.media(M)
        background-color: rgba(#999, .5)
        // background-color: #999
        height: 120px
        width: 120px

    img
      display: block
      width: 100%
      height: auto
      border-radius: 100%
      animation: 2s ease-in-out infinite pulseScale

    h1
      font-size: 18px
      line-height: 1.2
      background-color: rgba(#fff,.5)
      position: relative
      padding: 0 .5em
      @include media.media(M)
        font-size: 30px

    &Text
      position: relative
      background-color: rgba(#fff,.5)
      padding: 0 .5em

  @keyframes pulseShadow
    0%
      box-shadow: 0 0 0 0 rgba(#999, .5)
    100%
      box-shadow: 0 0 0 250px rgba(#999, 0)

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
