import { VExpansionPanel } from 'vuetify/lib/components';
import Toggleable from 'vuetify/lib/mixins/toggleable';
import Measurable from 'vuetify/lib/mixins/measurable';
import intersect from 'vuetify/lib/directives/intersect';
import { getSlot } from 'vuetify/lib/util/helpers';

export default {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  directives: { intersect },
  extends: VExpansionPanel,
  mixins: [Measurable, Toggleable],

  props: {
    options: {
      type: Object,
      // For more information on types, navigate to:
      // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
      default: () => ({
        root: undefined,
        rootMargin: undefined,
        threshold: undefined,
      }),
    },
    transition: {
      type: String,
      default: 'fade-transition',
    },
    shown: {
      required: false,
    },
  },

  computed: {
    styles() {
      return {
        ...this.measurableStyles,
      };
    },
  },

  data() {
    return {
      isShown: !!this.shown,
    };
  },

  watch: {
    shown(val) {
      this.isShown = !!val;
    },

    isShown(val) {
      !!val !== this.shown && this.$emit('onShown', val);
    },
  },

  methods: {
    genContent() {
      const slot = getSlot(this);

      if (this.isShown) return slot;

      return;

      // /* istanbul ignore if */
      // if (!this.transition) return slot;

      // const children = [];

      // if (this.isShown) children.push(slot);

      // return this.$createElement(
      //   'transition',
      //   {
      //     props: { name: this.transition },
      //   },
      //   children
      // );
    },
    onObserve(entries, observer, isIntersecting) {
      if (this.isShown) return;

      this.isShown = isIntersecting;
    },
  },

  render(h) {
    return h(
      'div',
      {
        staticClass: 'v-expansion-panel v-lazy',
        class: this.classes,
        attrs: {
          ...this.$attrs,
          'aria-expanded': String(this.isActive),
        },
        directives: [
          {
            name: 'intersect',
            value: {
              handler: this.onObserve,
              options: this.options,
            },
          },
        ],
        on: this.$listeners,
        style: this.styles,
      },
      [this.genContent()]
    );
  },
};
