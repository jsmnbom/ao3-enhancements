import { VCombobox } from 'vuetify/lib';
import TagOptionSelectList from './TagOptionSelectList';

export default {
  name: 'TagOptionCombobox',
  extends: VCombobox,

  computed: {
    $_menuProps() {
      const props = VCombobox.options.computed.$_menuProps.call(this);
      delete props.maxHeight;
      return props;
    },
  },

  methods: {
    genList() {
      const slots = ['prepend-item', 'no-data', 'append-item']
        .filter((slotName) => this.$slots[slotName])
        .map((slotName) =>
          this.$createElement(
            'template',
            {
              slot: slotName,
            },
            this.$slots[slotName]
          )
        );
      const list = this.$createElement(
        TagOptionSelectList,
        {
          ...this.listData,
        },
        slots
      );

      return this.$createElement('div', {}, [
        this.$slots['prepend-list'],
        list,
      ]);
    },
  },
};
