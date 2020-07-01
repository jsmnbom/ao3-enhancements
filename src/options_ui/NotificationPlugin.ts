import { Component, Vue } from 'vue-property-decorator';
import { VueConstructor } from 'vue';

@Component
export class NotificationPlugin extends Vue {
  text = '';
  showing = false;
  color = '';

  add(text: string, color: string): void {
    setTimeout(
      () => {
        this.text = text;
        this.color = color;
        this.showing = true;
      },
      this.showing ? 250 : 0
    );
    this.showing = false;
  }

  install(vue: VueConstructor<Vue>): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    vue.prototype.$notification = this;
  }
}
