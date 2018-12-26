<template>
  <nuxt/>
</template>

<style lang="sass">
  body
    text-align: center
    font-size: 18px
    line-height: 1.5
    font-family: 'Montserrat', sans-serif
    background-color: #eee
    color: #333

    section
      position: absolute
      width: 100%
      height: 100%
      display: flex
      justify-content: center
      align-items: center
      flex-direction: column
      padding: 20px
      box-sizing: border-box

      // .siteFrame
      //   border: none
      //   width: 100%
      //   height: 100%
      //   position: absolute
      //   top: 0
      //   left: 0

      .anim
        position: relative
        border-radius: 500px
        width: 120px
        height: 120px
        // overflow: hidden

        &:before
          position: absolute
          content: ''
          top: 0
          left: 0
          width: 100%
          height: 100%
          border-radius: 50%
          animation: 2s ease infinite pulse
          box-shadow: 0 0 0

        &:after
          position: absolute
          content: ''
          top: 0
          left: 0
          width: 100%
          height: 100%
          border-radius: 50%
          animation: 2s ease .5s infinite pulse
          box-shadow: 0 0 0

      img
        display: block
        border-radius: 500px
        width: 120px
        height: 120px
        border: 2px solid #999
        box-sizing: border-box

      h1
        font-size: 30px
        background-color: rgba(#fff,.5)
        position: relative
        padding: 0 .75em

      .text
        position: relative
        background-color: rgba(#fff,.5)
        padding: 0 .75em

  @keyframes pulse
    0%
      box-shadow: 0 0 0 0 rgba(#999, 1)
    100%
      box-shadow: 0 0 0 280px rgba(#999, 0)

</style>
