<template>
  <div class="ccv-donut-chart"></div>
</template>

<script lang='js'>
/* eslint-disable */
import { DonutChart } from '@carbon/charts/charts/donut';

const CcvBaseChart = {
  name: 'CcvBaseChart',
  data() {
    return {
      coreChart: null,
    };
  },
  props: {
    data: { type: [Object, Array], required: true },
    options: { type: Object, required: true },
  },
  watch: {
    data: {
      handler: function (newData) {
        this.coreChart.model.setData(newData);
      },
      deep: true
    },
    options: {
      handler: function (newOptions) {
        this.coreChart.model.setOptions(newOptions);
      },
      deep: true
    }
  }
};

export default {
  name: 'CcvDonutChart',
  extends: CcvBaseChart,
  mounted() {
    this.coreChart = new DonutChart(this.$el, {
      data: this.data,
      options: this.options,
    });
  }
};
</script>

<style lang="scss">
@import '~@carbon/themes/scss/themes';
$carbon--theme: $carbon--theme--white;
@import '~@carbon/charts/styles/styles.scss';
.theme--dark {
  @import '~@carbon/charts/styles/styles-g100.scss';
}
.bx--chart-holder,
.bx--chart-holder .bx--cc--chart-wrapper {
  background: none !important;
}
.ccv-donut-chart .legend .bx--cc--legend {
  justify-content: right;
}
</style>