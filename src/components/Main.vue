<template>
    <div class="nos-container">
      <div class="nos-row">
        <form>
          <label for="mode">Mode:</label>
          <ul class="nos-list-group">
            <li class="nos-list-group-item">
              <label class="nos-form-check-label">
                <input class="nos-form-check-input" name="mode" type="radio" value="0" v-model="mode" :disabled="active">
                Single Element
              </label>
            </li>
            <li class="nos-list-group-item">
              <label class="nos-form-check-label">
                <input class="nos-form-check-input" name="mode" type="radio" value="1" v-model="mode" :disabled="active">
                Multiple Elements
              </label>
            </li>
            <li class="nos-list-group-item">
              <label class="nos-form-check-label">
                <input class="nos-form-check-input" name="mode" type="radio" value="2" v-model="mode" :disabled="active">
                String Search
              </label>
            </li>
          </ul>
        </form>
      </div>
      <div class="nos-row">
          <div class="nos-col-12" v-if="!active">
              <button class="nos-btn nos-btn-block nos-btn-primary" @click="start">Start</button>
          </div>
          <div class="nos-col-12" v-if="active">
              <button class="nos-btn nos-btn-block nos-btn-warning" @click="stop">Stop</button>
          </div>
      </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  NOS_PICKER_MODE,
  NOS_PICKER_STATE,
} from '../interfaces';

export default Vue.extend({
  created: function () {
    chrome.runtime.sendMessage({ action: 'query' }, (response) => {
        this.active = response.hasStarted;
        this.mode = parseInt(response.mode);
        this.state = parseInt(response.state);
    });
  },
  data() {
    return {
      active: false,
      mode: NOS_PICKER_MODE.SINGLE,
      state: NOS_PICKER_STATE.INIT
    };
  },
  methods: {
    start() {
      this.active = true;
      chrome.runtime.sendMessage({ action: "start", mode: this.mode, state: NOS_PICKER_STATE.INIT }, response => {
        console.log('start', response);
      });
    },
    stop() {
        chrome.runtime.sendMessage({action: 'stop', mode: this.mode }, (response) => {
          console.log('stop', response);
          this.active = false;
        });
    }
  }
});
</script>