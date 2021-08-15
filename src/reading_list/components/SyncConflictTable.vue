<template lang="pug" functional>
.table
  template(v-for='{ key, text, local, remote, conflict } in props.table')
    span(
      v-for='(data, i) in [text, local, remote]',
      :key='text + i',
      :class='{ conflict }'
    ) 
      slot(:name='key', :data='data', v-if='i !== 0') {{ data }}
      template(v-else) {{ data }}
</template>

<style lang="scss" scoped>
@import '~vuetify/src/styles/styles.sass';
.table {
  display: grid;
  grid-template-columns: minmax(max-content, 1fr) 1fr 1fr;
  > span {
    margin: 0px 2px;
    padding: 2px 4px;
  }
  > span:nth-child(-n + 3) {
    font-weight: 500;
  }
  > span:not(:nth-last-child(-n + 3)) {
    border-bottom: thin solid rgba(0, 0, 0, 0.12);
  }
  > span.conflict {
    $border: 2px dashed var(--v-error-darken3);
    margin-top: -2px;
    border-top: $border;
    border-bottom: $border;
    &:nth-child(3n + 1) {
      border-left: $border;
    }
    &:nth-child(3n + 3) {
      border-right: $border;
    }
  }
  > span:nth-child(3n + 2) {
    background-color: rgba(map-get($blue, 'base'), 0.2);
  }
  > span:nth-child(3n + 3) {
    background-color: rgba(map-get($purple, 'base'), 0.2);
  }
}
</style>