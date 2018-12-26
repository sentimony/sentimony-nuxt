<template>
  <nuxt/>
</template>

<style lang="sass">
  body
    text-align: center
    font-size: 18px
    line-height: 1.5
    font-family: 'Montserrat', sans-serif
    background-color: #f5f5f5
    color: #262626

    section
      position: absolute
      width: 100%
      height: 100%
      display: flex
      justify-content: center
      align-items: center
      flex-direction: column

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

      img
        display: block
        border-radius: 500px
        width: 120px
        height: 120px

      h1
        font-size: 30px

  @keyframes pulse
    0%
      box-shadow: 0 0 0 0 rgba(#1565c0, 1)
    100%
      box-shadow: 0 0 0 180px rgba(#1565c0, 0)

</style>
