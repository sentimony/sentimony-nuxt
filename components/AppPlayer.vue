<template>
  <div class="AppPlayer">
    <!-- <img class="AppPlayer__bg" src="~/static/donate-bg.svg" alt="AppPlayer bg"> -->
    <div class="AppPlayer__wrapper">
      <!-- <p>AppPlayer</p> -->

      <div class="AppPlayer__player-tabs">
    <div class="app-tabs">
      <!-- <div class="AppPlayer__youtube-player"> -->
        <div>
          <div class="AppPlayer__app-tab">

          <div class="AppPlayer__youtube-player">
        <iframe 
          class="AppPlayer__youtube-player-iframe"
          :src="'https://www.youtube-nocookie.com/embed/videoseries?list=' + youtube_playlist_id + '&autoplay=1&mute=1&loop=1'"
          title="'YouTube video player'"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      <!-- </div> -->
       </div>

    <!-- <div><small>Unmute me :)</small></div> -->

       </div>
    </div>
    </div>
    </div>
    </div>
    
  </div>
</template>

<script>
  export default {
    data: () => ({
      youtube_playlist_id: 'PLp2GaPnw5O3PoanCB55pDHe0u5t1kXXLY',
    })
  }
</script>

<style lang="scss">
  @import '../node_modules/coriolan-ui/tools/variables';
  @import '../assets/scss/page';
  @import '../node_modules/coriolan-ui/mixins/ratio';
  @import '../assets/scss/iframe-size';

  .AppPlayer {
    position: relative;
    // color: #000;
    // // background-color: #fff;
    // overflow: hidden;
    color: #fff;

    // @extend .page;
    // position: relative;

    // &__wrapper {
    //   margin: 0 auto;
    //   max-width: 1278px;
    //   text-align: left;
    //   border-top: 1px solid rgba(#fff,.3);
    //   padding: 1.8em 0 1.8em;
    //   box-sizing: border-box;
    //   position: relative;
    //   z-index: 40;
    //   display: flex;
    //   align-items: flex-start;
    //   justify-content: space-between;
    //   flex-direction: column;

    //   @include media(L) {
    //     flex-direction: row;
    //     padding-top: 40px;
    //   }
    // }

    
    // &__bg {
    //   position: absolute;
    //   bottom: 0;
    //   left: 50%;
    //   transform: translateX(-50%);
    // }

    &__wrapper {
      width: 100%;
      max-width: 420px;
      // margin: 0 auto;
      // padding: 5em 10px;
      box-sizing: border-box;
      position: relative;
      color: #fff;
      position: fixed;
      top: 50%;
      // bottom: 0;
      right: 0;
      // max-width: 300px;
      z-index: 50;
      margin: 0 auto;
      transform: translateY(-50%);
    }

    &__player-tabs {
      // max-width: 320px - 20px * 2;
      padding: 0 20px 20px;



    }

    &__player-iframe {
      margin: 0 auto;
      // max-width: 540px;

    }

    &__youtube-player {
      @include ratio(100%,16,9);
      @extend .sentimony-iframe;
      // border-radius: 0px;


      &-iframe {
        border-radius: 6px;
        border: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 143%;
        height: 143%;
        transform: scale(.7);
        transform-origin: top left;
      }
    }

    &__app-tab {
      padding: 12px;
      background-color: rgba(204, 204, 204, 0.4);
      // padding: 20px 4px 4px;
      border-radius: 9px;
      box-shadow: $shadow;

    }
  }

</style>
