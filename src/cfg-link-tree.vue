<template>
  <div>
    <md-checkbox v-model="isShown_comp">{{ title }}</md-checkbox>
    <template v-if="isShown_comp">
      
      <md-field>
        <label>Hardware Context name</label>
        <md-input v-model="contextName_comp"></md-input>
      </md-field>

     
    </template>
  </div>
</template>

<script>
export default {
  name: "CfgLinkTree",
  data() {
    return {};
  },
  props: {
    isShown: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    contextName: {
      type: String,
      required: true
    }
  },
  computed: {
    isShown_comp: {
      get() {
        return this.isShown;
      },
      set(value) {
        this.$emit('update:isShown', value);
      }
    },
    contextName_comp: {
      get() {
        return this.contextName;
      },
      set(value) {
        // Emit the event to the parent to notify the parent component of any changes
        this.$emit('update:contextName', value);
      }
    }
  }
};
</script>


<style scoped></style>