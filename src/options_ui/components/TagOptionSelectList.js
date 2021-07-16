import VSelectList from 'vuetify/lib/components/VSelect/VSelectList';

export default {
  name: 'TagOptionSelectList',
  extends: VSelectList,

  render() {
    const r = VSelectList.options.render.call(this);
    this.$nextTick(() => {
      r.elm.style.maxHeight = '300px';
      r.elm.style.overflowY = 'auto';
      r.elm.style.paddingTop = '0';
      r.elm.style.paddingBottom = '0';
    });
    return r;
  },
};
