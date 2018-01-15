import Vue from "vue";
import MainComponent from "./components/Main.vue";

let v = new Vue({
    el: "#app",
    template: `
    <div class="nos-container">
        <h1 class="nos-text-nowrap">No's Picker Tool</h1>
        <main-component/>
    </div>
    `,
    components: {
        MainComponent
    }
});