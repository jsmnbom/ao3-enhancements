<template lang="pug">
.sync-status(:class='syncing || complete ? "active" : ""')
  .d-flex.justify-center(style='height: 7em')
    .circle-loader(:class='complete ? "load-complete" : ""')
      .checkmark.draw(v-if='complete')
  .log
    .subtitle-1.text--secondary(
      v-for='(step, index) in steps',
      :key='index',
      v-html='step'
    )
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class SyncDialogStatus extends Vue {
  @Prop(Boolean) readonly syncing!: boolean;
  @Prop(Boolean) readonly complete!: boolean;
  @Prop() readonly steps!: string[];
}
</script>

<style lang="scss" scoped>
$loader-size: 7em;
$check-height: $loader-size/2;
$check-width: $check-height/2;
$check-left: ($loader-size/6 + $loader-size/12);
$check-thickness: 3px;
$check-color: var(--v-success-base);

.circle-loader {
  margin-bottom: $loader-size/2;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-left-color: $check-color;
  animation: loader-spin 1.2s infinite linear;
  position: relative;
  display: inline-block;
  vertical-align: top;
  border-radius: 50%;
  width: $loader-size;
  height: $loader-size;
}

.load-complete {
  -webkit-animation: none;
  animation: none;
  border-color: $check-color;
  transition: border 500ms ease-out;
}

.checkmark {
  &.draw:after {
    animation-duration: 800ms;
    animation-timing-function: ease;
    animation-name: checkmark;
    transform: scaleX(-1) rotate(135deg);
  }

  &:after {
    opacity: 1;
    height: $check-height;
    width: $check-width;
    transform-origin: left top;
    border-right: $check-thickness solid $check-color;
    border-top: $check-thickness solid $check-color;
    content: '';
    left: $check-left;
    top: $check-height;
    position: absolute;
  }
}

@keyframes loader-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes checkmark {
  0% {
    height: 0;
    width: 0;
    opacity: 1;
  }
  20% {
    height: 0;
    width: $check-width;
    opacity: 1;
  }
  40% {
    height: $check-height;
    width: $check-width;
    opacity: 1;
  }
  100% {
    height: $check-height;
    width: $check-width;
    opacity: 1;
  }
}
.log {
  padding: 16px 0;
  overflow-y: hidden;
  overflow-x: hidden;
  height: 64px;
  text-align: center;
  position: relative;
  > div {
    position: absolute;
    width: 100%;
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    &:not(:last-child) {
      animation: scroll-out 0.3s forwards;
    }
    &:last-child {
      animation: scroll-in 0.3s forwards;
    }
  }
}
@keyframes scroll-in {
  0% {
    transform: translate(0, 16px);
    opacity: 0;
  }
  100% {
    transform: translate(0, 0);
    opacity: 1;
  }
}
@keyframes scroll-out {
  0% {
    transform: translate(0, 0px);
    opacity: 1;
  }
  100% {
    transform: translate(0, -16px);
    opacity: 0;
  }
}
.sync-status {
  height: 0;
  transition: cubic-bezier(0.65, 0, 0.35, 1) 0.3s;
  overflow: hidden;
  &.active {
    height: 160px;
  }
}
</style>