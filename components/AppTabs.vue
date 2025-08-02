<template>
  <div>
    <ul class="app-tabs__header d-flex">
      <li v-for="(i, index) in tabs"
        :key="index"
        @click="selectTab(index)"
        :class='{"app-tab__selected": (index == selectedIndex)}'
        v-ripple
      >
        <div class="d-flex body-2 align-center" style="height:40px;">
          <img
            v-if="i.$attrs.icon"
            class=""
            :src="i.$attrs.icon"
            :alt="i.title + ' Icon'"
            style="width:20px;"
          >
          <span v-if="i.title" v-html="i.title" style="margin-left:6px;"/>
        </div>
      </li>
    </ul>
    <slot></slot>
  </div>
</template>

<script>
  export default {
    // props: ['title', 'icon'],
    data() {
      return {
        selectedIndex: 0,
        tabs: []
      }
    },
    created () {
      this.tabs = this.$children
    },
    mounted () {
      this.selectTab(0)
      // console.log('tabs = ' + this.tabs)
      // console.log(this.tabs)
    },
    methods: {
      selectTab (i) {
        this.selectedIndex = i
        this.tabs.forEach((tab, index) => {
          tab.isActive = (index === i)
        })
      }
    }
  }
</script>

<style lang="scss">
  @use '@/assets/scss/coriolanMedia' as media;

  .app-tabs__header {
    list-style: none;
    margin: 0;
    padding: 0;

    & > li {
      cursor: pointer;
      margin-left: 6px;
      padding: 0 12px;
      background-color: rgba(204, 204, 204, 0.4);
      opacity: .5;
      border-radius: 6px 6px 0 0;
      transition: opacity .2s ease;

      &:first-child {
        margin-left: 0;
      }

      &:hover {
        opacity: .75;
      }

      &.app-tab__selected {
        opacity: 1;
        cursor: default;
      }
    }

    & span {
      display: none;

      @include media.media(S) {
        display: block;
      }
    }
  }
</style>
