import Vue from 'vue'
import Ripple from 'vue-ripple-directive'

Ripple.color = 'rgba(255, 255, 255, 0.1)';
Ripple.zIndex = 111111155;
Vue.directive('ripple', Ripple);
