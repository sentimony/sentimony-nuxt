<template>
  <div>
    <!-- <div v-html="2"></div> -->

    <ul class="app-tabs__header">
      <li v-for="(i, index) in tabs"
        :key="index"
        @click="selectTab(index)"
        :class='{"tab__selected": (index == selectedIndex)}'
      >
        <div class="d-flex body-2">
          <img
            v-if="i.$attrs.icon"
            class=""
            :src="i.$attrs.icon"
            :alt="i.title + ' Icon'"
            style="width:20px;margin-right:6px;align-items: center;"
          >
          <!-- <span>icon = '{{ icon }}'</span> -->
          <!-- <span>i.icon = '{{ i.$attrs.icon }}'</span> -->
          <!-- <br> -->
          <span v-if="i.title">{{ i.title }}</span>
        </div>
      </li>
    </ul>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ['title', 'icon'],
  data () {
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
    console.log('tabs = ' + this.tabs)
    console.log(this.tabs)
  },
  methods: {
    selectTab (i) {
      this.selectedIndex = i
      // loop over all the tabs
      this.tabs.forEach((tab, index) => {
        tab.isActive = (index === i)
      })
    }
  }
}
</script>

<style lang="scss">
  .app-tabs__header {
    /* display: block; */
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .app-tabs__header > li {
    /* padding: 15px 30px; */
    /* border-radius: 10px; */
    /* margin: 0; */
    display: inline-block;
    // display: flex;
    // align-items: center;
    /* margin-right: 5px; */
    cursor: pointer;
    /* height: 3em; */
    // margin-left: .4em;
    margin-left: 6px;
    // padding: .8em;
    padding: 12px;
    background-color: rgba(204, 204, 204, 0.4);
    // font-size: 12px;
    opacity: .5;
    border-radius: 6px 6px 0 0;

    &:first-child {
      margin-left: 0;
    }

    &.tab__selected {
      opacity: 1;
    }
  }
  /* ul.tabs__header > li.tab__selected {
    font-weight: bold;
    border-radius: 10px 10px 0 0;
    border-bottom: 8px solid transparent;
  }
  .tab {
    display: inline-block;
    color: black;
    padding: 20px;
    min-width: 800px;
    border-radius: 10px;
    min-height: 400px;
  }
  .tabs__light .tab{
    background-color: #fff;
  }
  .tabs__light li {
    background-color: #ddd;
    color: #aaa;
  }
  .tabs__light li.tab__selected {
    background-color: #fff;
    color: #83FFB3;
  }
  .tabs__dark .tab{
    background-color: #555;
    color: #eee;
  }
  .tabs__dark li {
    background-color: #ddd;
    color: #aaa;
  }
  .tabs__dark li.tab__selected {
    background-color: #555;
    color: white;
  } */
</style>
